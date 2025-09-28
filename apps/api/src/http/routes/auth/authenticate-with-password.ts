import { compare } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyJwt from '@fastify/jwt'
import z from 'zod';

import { prisma } from '@/lib/prisma';
import { BadRequestError } from '../-errors/bad-request-error';

export async function authenticateWithPassword(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/sessions/password', 
        {
           schema: {
                tags: ['Auth'],
                summary: 'Autentica usuário com e-mail e senha',
                body: z.object({
                    email: z.email(),
                    password: z.string(),
                }),
                response: {
                    400: z.object({
                        message: z.string(),
                    }),
                    201: z.object({
                        token: z.string()
                    })
                }
            }, 
        }, 
        async (request, reply) => {
            const { email, password } = request.body

            const userFromEmail = await prisma.user.findUnique({
                where: {
                email,
                },
            })

            if (!userFromEmail) {
                // throw new BadRequestError('E-mail/senha inválido.')
                return reply.status(400).send({ message: 'E-mail/senha inválido.' })
            }

            if (userFromEmail.passwordHash === null) {
                throw new BadRequestError('Usuário não tenha uma senha, use o login social.')
            }

            const isPasswordValid = await compare(
                password,
                userFromEmail.passwordHash,
            )

            if (!isPasswordValid) {
                throw new BadRequestError('E-mail/senha inválido.')
            }

            const token = await reply.jwtSign(
                {
                    sub: userFromEmail.id,
                },
                {
                    sign: {
                        expiresIn: '7d',
                    },
                },
            )

            return reply.status(201).send({ token })
        },
    )
}