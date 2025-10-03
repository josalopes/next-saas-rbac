import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { createSlug } from "@/utils/create-slug";
import { BadRequestError } from "../-errors/bad-request-error";

export async function createOrganization(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .post('/organization', {
        schema: {
            tags: ['Organizations'],
            summary: 'Cria uma nova organização',
            securiry: [{ bearerAuth: [] }],
            body: z.object({
                name: z.string(),
                domain: z.string().nullish(),
                shouldAttachUserByDomain: z.boolean().optional()
            }),
            response: {
                400: z.object({
                        message: z.string(),
                    }),
                201: z.object({
                        organizationId: z.uuid()
                    })
            }
        },
      }, 
      async (request, reply) => {
        const userId = await request.getCurrentUserid()
        const { name, domain, shouldAttachUserByDomain } = request.body

        if (domain) {
            const organizationByDomain = await prisma.organization.findUnique({
                where: {
                    domain
                },
            })

            if (organizationByDomain) {
                throw new BadRequestError('Já existe uma organização com este domínio')
            }
        }

        const slug = createSlug(name)

        const organizationBySlug = await prisma.organization.findUnique({
            where: {
                slug
            },
        })

        if (organizationBySlug) {
            throw new BadRequestError('Já existe uma organização com este slug')
        }        

        const organization = await prisma.organization.create({
            data: {
                name,
                slug: createSlug(name),
                domain,
                shouldAttachUserByDomain,
                ownerId: userId,
                members: {
                    create: {
                        userId,
                        role: 'ADMIN',
                    },
                },
            },
        })

        return reply.status(201).send({
            organizationId: organization.id,
        })
      })
}