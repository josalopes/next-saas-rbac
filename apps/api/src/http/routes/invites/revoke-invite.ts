import { auth } from './../../middlewares/auth';
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { roleSchema } from "@saas/auth";

export async function revokeInvite(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .delete('/organization/:slug/invite/:inviteId', {
        schema: {
            tags: ['Invites'],
            summary: 'Revoga um convite',
            params: z.object({
                slug: z.string(),
                inviteId: z.uuid()
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
        const { slug, inviteId } = request.params
        const userId = await request.getCurrentUserid()
        const { organization, membership } = await request.getUserMembership(slug)

        if (!organization) {
            return reply.status(400).send({ message: 'Organização inexistente' })
        }
        
        const { cannot } = getUserPermissions(userId, membership.role)
        
        if (cannot('delete', 'Invite')) {
            return reply.status(401).send({ message: 'Você não tem permissão para criar projetos' })
        }  
      
        const invite = await prisma.invite.findFirst({
            where: {
                id: inviteId,
                organizationId: organization.id,
            }
        })

        if (!invite) {
            return reply.status(400).send({ message: 'Convite inexistente' })
        }


        await prisma.invite.delete({
            where: {
                id: invite.id,
            },
        })

        return reply.status(204).send()
      })
}