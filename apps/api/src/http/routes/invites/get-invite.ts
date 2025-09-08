import { auth } from './../../middlewares/auth';
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { roleSchema } from "@saas/auth";

export async function getInvite(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .get('/invite/:inviteId', {
        schema: {
            tags: ['Invites'],
            summary: 'Obtém detalhes de um convite',
            params: z.object({
                inviteId: z.string()
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                401: z.object({
                        message: z.string(),
                    }),
                200: z.object({
                        invite: z.object({
                            id: z.uuid(),
                            role: roleSchema,
                            email: z.email(),
                            createdAt: z.date(),
                            organization: {
                                name: z.string(),
                            },
                            author: z.object({
                                id: z.uuid(),
                                name: z.string().nullable(),
                                avatarUrl: z.url().nullable(),
                            }).nullable()
                        })
                    }),
            }
        },
      }, 
      async (request, reply) => {
        const { inviteId } = request.params

        const invite = await prisma.invite.findUnique({
            where: {
                id: inviteId
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    }
                },
                organization: {
                    select: {
                        name: true,
                    }
                }
            }
        }) 

        if (!invite) {
            return reply.status(400).send({ message: 'Convite inexistente' })
        }


        return reply.status(200).send({ invite })
      })
}