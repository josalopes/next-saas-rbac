import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { getUserPermissions } from "@/utils/get-user-permissions";

export async function getOrganizationBilling(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .get(
            '/organization/:slug/billing', 
            {
                schema: {
                    tags: ['Billing'],
                    summary: 'Obtém os detalhes de faturamento da organização',
                    security: [{ bearerAuth: [] }],
                    params: z.object({
                        slug: z.string(),
                    }),
                    response: {
                        401: z.object({
                            message: z.string(),
                            }),
                        200: z.object({
                            billing: z.object({
                                seats: z.object({
                                amount: z.number(),
                                unit: z.number(),
                                price: z.number(),
                                }),
                                projects: z.object({
                                amount: z.number(),
                                unit: z.number(),
                                price: z.number(),
                                }),
                                total: z.number(),
                            }),
                        }),
                    },                
                },
            }, 
            async (request, reply) => {
                const { slug } = request.params

                const userId = await request.getCurrentUserid()
                const { organization, membership } = await request.getUserMembership(slug)

                 const { cannot } = getUserPermissions(userId, membership.role)

                if (cannot('get', 'Billing')) {
                    return reply.status(401).send({ message: 'Você não tem permissaão de consultar informações de faturamento' })
                }

                const [amountOfMembers, amountOfProjects] = await Promise.all([
                    prisma.member.count({
                        where: {
                        organizationId: organization.id,
                        role: { not: 'BILLING' },
                        },
                    }),
                    prisma.project.count({
                        where: {
                        organizationId: organization.id,
                        },
                    }),
                ])

                return {
                    billing: {
                        seats: {
                        amount: amountOfMembers,
                        unit: 10,
                        price: amountOfMembers * 10,
                        },
                        projects: {
                        amount: amountOfProjects,
                        unit: 20,
                        price: amountOfProjects * 20,
                        },
                        total: amountOfMembers * 10 + amountOfProjects * 20,
                    },
                }
            },
        )
    }