import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { userSchema, organizationSchema, defineAbilityFor } from '@saas/auth';
import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { BadRequestError } from "../bad-request-error";
import { createSlug } from "@/utils/create-slug";
import { getUserPermissions } from "@/utils/get-user-permissions";

export async function shutdownOrganization(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .delete('/organization/:slug', {
        schema: {
            tags: ['Organizations'],
            summary: 'Desativa uma organização',
            params: z.object({
                slug: z.string()
            }),
            response: {
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

        const authOrganization = organizationSchema.parse({
            id: organization.id,
            ownerId: organization.ownerId,
        })

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', authOrganization)) {
            return reply.status(401).send({ message: 'Você não tem permissão para desativar esta organização' })
        }


        await prisma.organization.delete({
            where: {
                id: organization.id,
            }
        })

        return reply.status(204).send()
    })
}