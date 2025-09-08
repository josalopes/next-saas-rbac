import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { roleSchema } from "@saas/auth";

export async function getMembers(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .get('/organization/:slug/members', {
        schema: {
            tags: ['Members'],
            summary: 'Obtém todos os membros dentro de uma organização',
            params: z.object({
                slug: z.string(),
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                401: z.object({
                        message: z.string(),
                    }),
                200: z.object({
                    members: z.array(
                            z.object({
                                userId: z.uuid(),
                                id: z.uuid(),
                                role: roleSchema,
                                name: z.string().nullable(),
                                email: z.email(),
                                avatarUrl: z.url().nullable(),
                            }),
                        ),
                    }),
            },
        },
      }, 
      async (request, reply) => {
        const { slug } = request.params
        const userId = await request.getCurrentUserid()
        const { organization, membership } = await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)
        
        if (cannot('get', 'User')) {
            return reply.status(401).send({ message: 'Você não tem permissão para visualizar membros' })
        } 

        if (!organization) {
            return reply.status(400).send({ message: 'Organização inexistente' })
        }

        const members = await prisma.member.findMany({
            select: {
                id: true,
                role: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    }
                },
            },
            where: {
                organizationId: organization.id
            },
            orderBy: {
                role: 'asc',
            },
        })

        const membersWithRole = members.map(({ user: { id: userId, ...user }, ...member }) => {
            return {
                ...user,
                ...member,
                userId
            }
        })

        return reply.send({ members: membersWithRole })
      })
}