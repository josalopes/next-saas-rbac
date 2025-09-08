import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { roleSchema } from "@saas/auth";

export async function removeMember(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .delete('/organization/:slug/member/:memberId', {
        schema: {
            tags: ['Members'],
            summary: 'Remove um membro da organização',
            params: z.object({
                slug: z.string(),
                memberId: z.uuid(),
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                401: z.object({
                        message: z.string(),
                    }),
                204: z.null(),
            },
        },
      }, 
      async (request, reply) => {
        const { slug, memberId } = request.params
        const userId = await request.getCurrentUserid()
        const { organization, membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)
        
        if (cannot('delete', 'User')) {
            return reply.status(401).send({ message: 'Você não tem permissão para remover membros' })
        } 

        if (!organization) {
            return reply.status(400).send({ message: 'Organização inexistente' })
        }

        await prisma.member.delete({
            where: {
                id: memberId,
                organizationId: organization.id
            },
        })

        return reply.status(204).send()
      })
}