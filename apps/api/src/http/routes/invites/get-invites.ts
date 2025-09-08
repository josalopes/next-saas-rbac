import { auth } from './../../middlewares/auth';
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { roleSchema } from "@saas/auth";

export async function getInvites(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .get('/organization/:slug/invites', {
        schema: {
            tags: ['Invites'],
            summary: 'Obtém os convites de uma organização',
            params: z.object({
                slug: z.string()
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                401: z.object({
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
        const { slug } = request.params
        const userId = await request.getCurrentUserid()
        const { organization, membership } = await request.getUserMembership(slug)

        if (!organization) {
            return reply.status(400).send({ message: 'Organização inexistente' })
        }
        
        const { cannot } = getUserPermissions(userId, membership.role)
        
        if (cannot('get', 'Invite')) {
            return reply.status(401).send({ message: 'Você não tem permissão para visualizer convites' })
        }  
      
        

        const invites = await prisma.invite.findMany({
           where: {
                organizationId: organization.id
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

        return reply.status(200).send({ invites})
      })
}