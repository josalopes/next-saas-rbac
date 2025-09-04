import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { UnauthorizedError } from '../routes/unauthorized-error'

export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserid = async () => {
        try {
            const { sub } = await request.jwtVerify<{ sub: string }>()

            return sub
        } catch {
            throw new UnauthorizedError('Token de autenticação inválido')
        }
    }
  })  
})

