import { hash } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { BadRequestError } from "../-errors/bad-request-error";

export async function createAccount(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/users', 
        {
            schema: {
                tags: ['Auth'],
                summary: 'Cria uma nova conta de usuário',
                body: z.object({
                    name: z.string(),
                    email: z.email(),
                    password: z.string().min(6)
                }),
                response: {
                    400: z.object({
                        message: z.string(),
                    }),
                    201: z.object({

                    })
                }
            },            
        }, 
        async (request, reply) => {
            const { name, email, password } = request.body

            const userWithSameEmail = await prisma.user.findUnique({
                where: {
                    email
                },
            })

            if (userWithSameEmail) {
                // throw new BadRequestError('Este e-mail já está em uso')
                return reply.status(400).send({ message: 'Este e-mail já está em uso' })
            }

            const [, domain] = email.split('@')

            const autoJoinOrganization = await prisma.organization.findFirst({
                where: {
                    domain,
                    shouldAttachUserByDomain: true,
                }
            })

            const passwordHash = await hash(password, 6)

            await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    member_on: autoJoinOrganization ? {
                        create: {
                            organizationId: autoJoinOrganization.id,
                        }
                    } : undefined,
                },
            })

            return reply.status(201).send()
        },
    )
}