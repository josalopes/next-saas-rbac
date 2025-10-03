"use server"
import { z } from 'zod'
import { HTTPError } from 'ky'

import { createProject } from '@/http/create-project'
import { getCurrentOrg } from '@/auth/auth'

const projectSchema = z.object({
    name: z.string().min(4, { message: 'O nome deve ter no mínimo 4 caracteres'}),
    description: z.string(),
})

export async function createProjectAction(data: FormData) {
    const entries = Object.fromEntries(data.entries())
    const result = projectSchema.safeParse(entries)
    
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        
        return { success: false, message: null, errors }
    }

    const { name, description } = result.data

    try {
        const org = await getCurrentOrg();

        await createProject({
            org: org!, 
            name, 
            description,
        })          
    } catch (err) {
        if (err instanceof HTTPError) {
            const { message, status } = await err.response.json()
            return { 
                success: false, 
                message, 
                errors: null
             }    
        }

        return { 
            success: false, 
            message: 'Erro inesperado ao criar projeto', 
            errors: null
         }
    }

    return { success: true, message: 'Projeto salvo com sucesso', errors: null }
}


