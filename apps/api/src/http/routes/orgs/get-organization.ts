import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { BadRequestError } from "../-errors/bad-request-error";

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
                            organizacao: z.object({
                                id: z.uuid(),
                                name: z.string(),
                                slug: z.string(),
                                domain: z.string().nullable(),
                                shouldAttachUsersByDomain: z.boolean(),
                                avatarUrl: z.url().nullable(),
                                createdAt: z.date(),
                                updatedAt: z.date(),
                                ownerId: z.uuid()
                            }),
                        })
                    },                
                },
            }, 
            async (request, reply) => {
                const { slug } = request.params
                const organization = await prisma.organization.findUnique({
                  where: { slug },
                })

                if (!organization) {
                    throw new BadRequestError('Organização não encontrada')
                }

                const organizacao = {
                    id: organization.id,
                    name: organization?.name,
                    slug: organization.slug,
                    domain: organization.domain,
                    shouldAttachUsersByDomain: organization.shouldAttachUserByDomain,
                    avatarUrl: organization.avatarUrl,
                    createdAt: organization.createdAt,
                    updatedAt: organization.updatedAt,
                    ownerId: organization.ownerId
                }

                // const organizacao = {
                //     id: org.id,
                //         name: org?.name,
                //         slug: org.slug,
                //         domain: org.domain,
                //         shouldAttachUsersByDomain: org.shouldAttachUsersByDomain,
                //         avatarUrl: org.avatarUrl,
                //         createdAt: org.createdAt,
                //         updatedAt: org.updatedAt,
                //         ownerId: org.ownerId
                // }

                return reply.status(200).send(
                    {organizacao}
                    // {
                    //     id: org.id,
                    //     name: org?.name,
                    //     slug: org.slug,
                    //     domain: org.domain,
                    //     shouldAttachUsersByDomain: org.shouldAttachUsersByDomain,
                    //     avatarUrl: org.avatarUrl,
                    //     createdAt: org.createdAt,
                    //     updatedAt: org.updatedAt,
                    //     ownerId: org.ownerId
                    // }
                )
            }
        )
    }