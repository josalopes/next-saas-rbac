import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { organizationSchema } from '@saas/auth';
import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { getUserPermissions } from "@/utils/get-user-permissions";

export async function updateOrganization(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .put('/organization/:slug', {
        schema: {
            tags: ['Organizations'],
            summary: 'Atualiza detalhes de uma organização',
            body: z.object({
                name: z.string(),
                domain: z.string().nullish(),
                shouldAttachUserByDomain: z.boolean().optional()
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
        const { name, domain, shouldAttachUserByDomain } = request.body

        const authOrganization = organizationSchema.parse({
            id: organization.id,
            ownerId: organization.ownerId,
        })

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', authOrganization)) {
            return reply.status(401).send({ message: 'Você não tem permissão para atualizar esta organização' })
        }

        if (domain) {
            const organizationByDomain = await prisma.organization.findFirst({
                where: {
                    domain,
                    slug: {
                        not: organization.id,
                    },
                },
            })

            if (organizationByDomain) {
                return reply.status(400).send({ message: 'Já existe uma organização com este domínio' })
            }
        }

        await prisma.organization.update({
            where: {
                id: organization.id,
            },
            data: {
                name,
                domain,
                shouldAttachUserByDomain,
            },
        })

        return reply.status(204).send()
    })
}