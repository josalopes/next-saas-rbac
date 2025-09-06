import { hash } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyJwt from '@fastify/jwt'
import z from 'zod';

import { prisma } from '@/lib/prisma';
import { auth } from '@/http/middlewares/auth';
import { UnauthorizedError } from '../unauthorized-error';

export async function resetPassword(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .register(auth)
        .post(
        '/password/reset', 
        {
           schema: {
                tags: ['Auth'],
                summary: 'Troca a senha',
                body: z.object({
                    code: z.string(),
                    password: z.email().min(6)
                }),              
                response: {
                    401: z.object({
                            message: z.string(),
                        }),
                    204: z.null()
                },
            }, 
        }, 
        async (request, reply) => {
            const { code, password } = request.body

            const tokenFromCode = await prisma.token.findUnique({
                where: { id: code },
            })

            if (!tokenFromCode) {
                // throw new UnauthorizedError():
                return reply.status(401).send({ message: 'Token não autorizado' })
            }

            const passwordHash = await hash(password, 6)

            await prisma.user.update({
                where: {
                    id: tokenFromCode.userId,
                },
                data: {
                    passwordHash,
                }
            })

            return reply.status(204).send()
        }
    )
}