import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { getUserPermissions } from "@/utils/get-user-permissions";

export async function getProject(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .get('/organization/:orgSlug/project/:projectSlug', {
        schema: {
            tags: ['Projects'],
            summary: 'Obtém os detalhes de um projeto dentro de uma organização',
            params: z.object({
                orgSlug: z.string(),
                projectSlug: z.uuid()
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                401: z.object({
                        message: z.string(),
                    }),
                200: z.object({
                        project: z.object({
                            id: z.uuid(),
                            name: z.string(),
                            description: z.string().nullable(),
                            slug: z.string(),
                            ownerId: z.uuid(),
                            organizationId: z.uuid(),
                            avatarUrl: z.url().nullable(),
                            owner: z.object({
                                        id: z.uuid(),
                                        name: z.string().nullable(),
                                        avatarUrl: z.url().nullable(),
                            })
                        })
                    }),
                },
            },
      }, 
      async (request, reply) => {
        const { orgSlug, projectSlug} = request.params
        const userId = await request.getCurrentUserid()
        const { organization, membership } = await request.getUserMembership(orgSlug)

        const { cannot } = getUserPermissions(userId, membership.role)
        
        if (cannot('get', 'Project')) {
            return reply.status(401).send({ message: 'Você não tem permissão para visualizar projetos' })
        } 

        if (!organization) {
            return reply.status(400).send({ message: 'Organização inexistente' })
        }

        const project = await prisma.project.findUnique({
            select: {
                id: true,
                name: true,
                description: true,
                slug: true,
                ownerId: true,
                organizationId: true,
                avatarUrl: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    }
                },
            },
            where: {
                slug: projectSlug,
                organizationId: organization.id
            }
        })

        if (!project) {
            return reply.status(400).send({ message: 'Projeto não encontrado nesta organização' })
        }

        return reply.send({ project })
      })
}