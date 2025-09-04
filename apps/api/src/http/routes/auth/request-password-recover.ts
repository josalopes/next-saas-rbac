import { compare } from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import fastifyJwt from '@fastify/jwt'
import z from 'zod';

import { prisma } from '@/lib/prisma';
import { BadRequestError } from '../bad-request-error';
import { auth } from '@/http/middlewares/auth';

export async function requestPasswordRecovery(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .register(auth)
        .post(
        '/password/recover', 
        {
           schema: {
                tags: ['Auth'],
                summary: 'Recupera senha',
                body: z.object({
                    email: z.email()
                }),              
                response: {
                    201: z.null()
                },
            }, 
        }, 
        async (request, reply) => {
            const { email } = request.body

            const userFromEmail = await prisma.user.findUnique({
                where: { email },
            })

            if (!userFromEmail) {
                return reply.status(201).send()
            }

            const { id: code } = await prisma.token.create({
                data: {
                    type: 'PASSWORD_RECOVER',
                    userId: userFromEmail.id,
                }
            })

            console.log('Recover password token: ', code)

            return reply.status(201).send()

        }
    )
}