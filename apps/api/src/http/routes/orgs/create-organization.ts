import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { BadRequestError } from "../bad-request-error";
import { createSlug } from "@/utils/create-slug";

export async function createOrganization(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .post('/organization', {
        schema: {
            tags: ['Organizations'],
            summary: 'Cria uma nova organização',
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
                // throw new BadRequestError('Já existe uma organização com este domínio')
                return reply.status(400).send({ message: 'Já existe uma organização com este domínio' })
            }
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