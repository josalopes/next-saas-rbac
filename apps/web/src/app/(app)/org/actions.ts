"use server"
import { z } from 'zod'
import { HTTPError } from 'ky'

import { createOrganization } from '@/http/create-organization'
import { getCurrentOrg } from '@/auth/auth'
import { updateOrganization } from '@/http/update-organization'
import { revalidateTag } from 'next/cache'

const organizationSchema = z.object({
    name: z.string().min(4, { message: 'O nome deve ter no mínimo 4 caracteres'}),
    domain: z.string()
    .nullable()
    .refine((value) => {
        if (value) {
            const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

            return domainRegex.test(value)
        }

        return true
    },
{
    message: 'Entre com umm domínio válido'
}),
   shouldAttachUsersByDomain: z.union([
        z.literal('on'),
        z.literal('off'),
        z.boolean(),
    ])
    .transform((value) => value === true || value === 'on')
    .default(false)
})
.refine(
    (data) => {
        if (data.shouldAttachUsersByDomain === true && !data.domain) {
            return false
        }

        return true
    },
    {
        message: 'O domínio é obrigatório ao habilitar a auto-vinculação'
    }
)

export type OrganizationSchema = z.infer<typeof organizationSchema>

export async function createOrganizationAction(data: FormData) {
    const entries = Object.fromEntries(data.entries())
    const result = organizationSchema.safeParse(entries)
    
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        
        return { success: false, message: null, errors }
    }

    const { name, domain, shouldAttachUsersByDomain } = result.data

    try {
        await createOrganization({
            name, domain, shouldAttachUsersByDomain,
        }) 
        
        revalidateTag('organizations')
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
            message: 'Erro inesperado ao criar organização', 
            errors: null
         }
    }

    return { success: true, message: 'Organização salva com sucesso', errors: null }
}


export async function updateOrganizationAction(data: FormData) {
    const currentOrg = await getCurrentOrg()
    
    const entries = Object.fromEntries(data.entries())
    const result = organizationSchema.safeParse(entries)
    
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        
        return { success: false, message: null, errors }
    }

    const { name, domain, shouldAttachUsersByDomain } = result.data

    try {
        await updateOrganization({
            org: currentOrg!,
            name, 
            domain, 
            shouldAttachUsersByDomain,
        })   
        
        revalidateTag('organizations')
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
            message: 'Erro inesperado ao criar organização', 
            errors: null
         }
    }

    return { success: true, message: 'Organização salva com sucesso', errors: null }
}

