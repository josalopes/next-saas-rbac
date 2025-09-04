import 'fastify'

declare module 'fastify' {
    export interface FastifyRequest {
        getCurrentUserid(): Promise<string>
    }
}