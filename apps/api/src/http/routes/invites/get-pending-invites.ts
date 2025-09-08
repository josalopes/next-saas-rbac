import { auth } from './../../middlewares/auth';
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { roleSchema } from "@saas/auth";

export async function getPendingInvites(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .get('/pending-invites', {
        schema: {
            tags: ['Invites'],
            summary: 'Obtém todos os convites pendentes para um usuário',
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                200: z.object({
                        invites: z.array(
                            z.object({
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
                        ) 
                    }),
            }
        },
      }, 
      async (request, reply) => {
        const userId = await request.getCurrentUserid()


        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!user) {
          return reply.status(400).send({ message: 'Usuário não encontrado' })
        }


        const invites = await prisma.invite.findMany({
           where: {
                email: user.email
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
            },
            orderBy: {
                createdAt: 'desc',
            }
        }) 

        return reply.status(200).send({ invites })
      })
}