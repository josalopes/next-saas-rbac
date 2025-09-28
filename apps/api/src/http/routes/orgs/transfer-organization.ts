import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { organizationSchema } from '@saas/auth';
import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { BadRequestError } from "../-errors/bad-request-error";

export async function transferOrganization(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .patch('/organization/:slug/owner', {
        schema: {
            tags: ['Organizations'],
            summary: 'Transfere a propriedade de uma organização',
            body: z.object({
                transferToUserId: z.uuid()
            }),
            params: z.object({
                slug: z.string()
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                401: z.object({
                        message: z.string(),
                    }),
                204: z.null()
            }
        },
      }, 
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserid()
        const { membership, organization } = await request.getUserMembership(slug)

        const { transferToUserId } = request.body

        const authOrganization = organizationSchema.parse({
            id: organization.id,
            ownerId: organization.ownerId,
        })

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('transfer_ownership', authOrganization)) {
          throw new BadRequestError('Você não tem permissão para transferir esta organização')
            // return reply.status(401).send({ message: 'Você não tem permissão para transferir esta organização' })
        }

        const transferMembership = await prisma.member.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: organization.id,
                    userId: transferToUserId,
                }
            }
        })

        if (!transferMembership) {
          throw new BadRequestError('O usuário destinatário não é membro desta organização')
          // return reply.status(400).send({ message: 'O usuário destinatário não é membro desta organização' })
        }

        await prisma.$transaction([
          prisma.member.update({
            where: {
              organizationId_userId: {
                organizationId: organization.id,
                userId: transferToUserId,
              },
            },
            data: {
              role: 'ADMIN',
            },
          }),
          prisma.organization.update({
            where: { id: organization.id },
            data: { ownerId: transferToUserId },
          }),
        ])

        return reply.status(204).send()
    })
}