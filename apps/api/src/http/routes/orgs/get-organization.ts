import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";

export async function getOrganization(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .get(
            '/organization/:slug', 
            {
                schema: {
                    tags: ['Organizations'],
                    summary: 'Obtém os detalhes de uma organização',
                    security: [{ bearerAuth: [] }],
                    params: z.object({
                        slug: z.string(),
                    }),
                    response: {
                        400: z.object({
                            message: z.string(),
                            }),
                        200: z.object({
                            id: z.uuid(),
                            name: z.string().describe('O papel do usuário na organização'),
                            domain: z.string().nullable().describe('O ID da organização'),
                            avatarUrl: z.url().nullable().describe('O ID da organização'),
                        }).describe('Detalhes da associação do usuário na organização'),
                    },                
                },
            }, 
            async (request, reply) => {
                const { slug } = request.params
                const organization = await prisma.organization.findUnique({
                  where: { slug },
                })

                if (!organization) {
                    // throw new BadRequestError('Organização não encontrada')
                  return reply.status(400).send({ message: 'Organização não encontrada' })
                }

                const org = {
                    id: organization.id,
                    name: organization?.name,
                    domain: organization.domain,
                    avatarUrl: organization.avatarUrl,
                }

                return reply.status(200).send(
                    { 
                        id: org.id, 
                        name: org.name, 
                        domain: org.domain, 
                        avatarUrl: org.avatarUrl
                    })
            }
        )
    }