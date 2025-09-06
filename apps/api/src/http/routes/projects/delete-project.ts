import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { userSchema, organizationSchema, defineAbilityFor, projectSchema } from '@saas/auth';
import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { BadRequestError } from "../bad-request-error";
import { createSlug } from "@/utils/create-slug";
import { getUserPermissions } from "@/utils/get-user-permissions";

export async function deleteProject(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .delete('/organization/:slug/project/:projectId', {
        schema: {
            tags: ['Project'],
            summary: 'Deleta um projeto',
            params: z.object({
                slug: z.string(),
                projectId: z.uuid()
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                401: z.object({
                        message: z.string(),
                    }),
                204: z.null()
            }
        },
      }, 
      async (request, reply) => {
        const { slug, projectId } = request.params
        const userId = await request.getCurrentUserid()
        const { membership, organization } = await request.getUserMembership(slug)

        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
                organizationId: organization.id
            }
        })

        if (!project) {
            return reply.status(400).send({ message: 'Projeto não encontrado' })
        }
        
        const authProject = projectSchema.parse(project)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', authProject)) {
            return reply.status(401).send({ message: 'Você não tem permissão para deletar projetos' })
        }

        await prisma.project.delete({
            where: {
                id: projectId,
            }
        })

        return reply.status(204).send()
    })
}