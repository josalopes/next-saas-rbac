import { auth } from './../../middlewares/auth';
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from 'zod'

import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/utils/get-user-permissions";
import { roleSchema } from "../../../../../../packages/auth/src/roles"

export async function createInvite(app: FastifyInstance) {
    app
      .withTypeProvider<ZodTypeProvider>()
      .register(auth)
      .post('/organization/:slug/invite', {
        schema: {
            tags: ['Invites'],
            summary: 'Cria um novo convite',
            body: z.object({
                email: z.string(),
                role: roleSchema,
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
                        inviteId: z.uuid(),
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
        
        if (cannot('create', 'Invite')) {
            return reply.status(401).send({ message: 'Você não tem permissão para criar projetos' })
        }  
      
        const { email, role } = request.body
        const [, domain] = email.split('@')

        if (organization.shouldAttachUserByDomain && domain === organization.domain) {
            return reply.status(400).send({ message: `Usuários com o domínio "${domain}" já são membros da organização ao realizarem login` })
        }

        const inviteWithSameEmail = await prisma.invite.findFirst({
            where: {
                email,
                organizationId: organization.id,
            }
        })

        if (inviteWithSameEmail) {
            return reply.status(400).send({ message: 'Já existe um convite pendente para este email' })
        }

        const memberWithSameEmail = await prisma.member.findFirst({
            where: {
                organizationId: organization.id,
                user: {
                    email,
                }
            }
        }) 

        if (memberWithSameEmail) {
            return reply.status(400).send({ message: 'Já existe um membro da organização com este email' })
        }

        const invite = await prisma.invite.create({
            data: {
                email,
                role,
                organizationId: organization.id,
                authorId: userId,
            },
        })  

        return reply.status(201).send({ inviteId: invite.id})
      })
}