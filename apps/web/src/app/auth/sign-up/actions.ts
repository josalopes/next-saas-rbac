"use server"
import { z } from 'zod'
import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { signUp } from '@/http/sign-up'

const signUpSchema = z.object({
    name: z.string().refine((value) => value.split(' ').length > 1, {
        message: 'Entre com seu nome completo'
    }),
    email: z.email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
    password_confirmation: z.string(),
})
.refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas informadas não são iguais',
    path: ['password_confirmation']
})

export async function signUpAction(data: FormData) {
    const entries = Object.fromEntries(data.entries())
    
    const result = signUpSchema.safeParse(entries)
    
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        
        return { success: false, message: null, errors }
    }

    const { name, email, password } = result.data

    try {
        await signUp({
            name, email, password,
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
            message: 'Erro inesperado ao tentar fazer login', 
            errors: null
         }
    }

    return { success: true, message: null, errors: null }
}


