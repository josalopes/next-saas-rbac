import { auth } from './../../middlewares/auth';
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { roleSchema } from "@saas/auth";

export async function rejectInvite(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .post('/invite/:inviteId/reject', {
        schema: {
            tags: ['Invites'],
            summary: 'Rejeitar convite de uma organização',
            params: z.object({
                inviteId: z.string()
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                204: z.null(),
            }
        },
      }, 
      async (request, reply) => {
        const { inviteId } = request.params
        const userId = await request.getCurrentUserid()

        const invite = await prisma.invite.findUnique({
            where: {
                id: inviteId
            },
        }) 

        if (!invite) {
            return reply.status(400).send({ message: 'Convite inexistente ou expirado' })
        }

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!user) {
          return reply.status(400).send({ message: 'Usuário não encontrado' })
        }

        if (user.email !== invite.email) {
          return reply.status(400).send({ message: 'Este convite pertence a outro usuário' })
        }

        await prisma.invite.delete({
            where: {
                id: invite.id,
            },
        })

        return reply.status(204).send()
      })
}