import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { auth } from "@/http/middlewares/auth";
import { roleSchema } from "@saas/auth/src/subjects/roles";

export async function getMembership(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .get(
            '/organization/:slug/membership', 
            {
                schema: {
                    tags: ['Organizations'],
                    summary: 'Obtém os detalhes da associação do usuário na organização',
                    security: [{ bearerAuth: [] }],
                    params: z.object({
                        slug: z.string(),
                    }),
                    response: {
                        200: z.object({
                            id: z.uuid(),
                            role: roleSchema.describe('O papel do usuário na organização'),
                            organizationId: z.uuid().describe('O ID da organização'),
                        }).describe('Detalhes da associação do usuário na organização'),
                    },                
                },
            }, 
            async (request, reply) => {
                const { slug } = request.params
                const { membership } = await request.getUserMembership(slug)

                const member = {
                        id: membership.id,
                        role: membership.role,
                        organization: membership.organizationId
                    }

                return reply.status(200).send(
                    { 
                        id: membership.id, 
                        role: membership.role, 
                        organizationId: membership.organizationId, 
                    })
            }
        )
    }