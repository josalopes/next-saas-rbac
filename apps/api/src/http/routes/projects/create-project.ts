import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { createSlug } from "@/utils/create-slug";
import { getUserPermissions } from "@/utils/get-user-permissions";

export async function createProject(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .post('/organization/:slug/project', {
        schema: {
            tags: ['Projects'],
            summary: 'Cria um novo projeto dentro de uma organização',
            body: z.object({
                name: z.string(),
                description: z.string(),
            }),
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
                201: z.object({
                        projectId: z.uuid()
                    })
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
        
        if (cannot('create', 'Project')) {
            return reply.status(401).send({ message: 'Você não tem permissão para criar projetos' })
        }  
      
        const { name, description } = request.body

        const project = await prisma.project.create({
            data: {
                name,
                slug: createSlug(name),
                description,
                organizationId: organization.id,
                ownerId: userId,
            },
        })  

        return reply.status(201).send({
            projectId: project.id,
        })
      })
}