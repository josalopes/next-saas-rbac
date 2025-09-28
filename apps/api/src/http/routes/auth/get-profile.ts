import { compare } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyJwt from '@fastify/jwt'
import z from 'zod';

import { prisma } from '@/lib/prisma';
import { BadRequestError } from '../-errors/bad-request-error';
import { auth } from '@/http/middlewares/auth';

export async function getProfile(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .register(auth)
        .get(
        '/profile', 
        {
           schema: {
                tags: ['Auth'],
                summary: 'Obtém perfil do usuário autenticado',
                security: [{ bearerAuth: [] }],           
                response: {
                    400: z.object({
                        message: z.string(),
                    }),
                    200: z.object({
                        user: z.object({
                            id: z.string(),
                            name: z.string().nullable(),
                            email: z.email(),
                            avatarUrl: z.string().nullable(),
                        }),
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
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                },
            })

            if (!user) {
                // throw new BadRequestError('Usuário não encontrado')
                return reply.status(400).send({ message: 'Usuário não encontrada' })
            }

            return reply.send({ user })
        }
    )
}