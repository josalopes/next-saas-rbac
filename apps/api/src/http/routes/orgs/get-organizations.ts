import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { roleSchema } from "@saas/auth";

export async function getOrganizations(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .get(
            '/organizations', 
            {
                schema: {
                    tags: ['Organizations'],
                    summary: 'Obtém as organizações vinculadas a um usuário',
                    security: [{ bearerAuth: [] }],
                    response: {
                        200: z.object({
                                organizations: z.array(
                                    z.object({
                                        id: z.uuid(),
                                        name: z.string().describe('O nome da organização'),
                                        slug: z.string().describe('O nome abreviado da organização'),
                                        avatarUrl: z.url().nullable().describe('O avatar da organização'),
                                        role: roleSchema.describe('O papel dos membros da organização'),
                                    }).describe('Detalhes da organização'),
                                ),
                        }).describe('Lista de organizações do usuário'),                
                    },
                }
            }, 
            async (request) => {
                const userId = await request.getCurrentUserid()
                const organizations = await prisma.organization.findMany({
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        avatarUrl: true,
                        members: {
                            select: {
                                role: true,
                            }, where: { userId },
                        }
                    },
                    where: {
                        members: {
                            some: {
                              userId
                            },
                        }
                    },
                })

                const organizationsWithUserRole = organizations.map(
                    ({ members, ...org}) => {
                        return {
                            ...org,
                            role: members[0].role,
                        }
                    }
                )

                return { organizations: organizationsWithUserRole }
            }
        )
    }