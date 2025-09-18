"use server"
import { z } from 'zod'
import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { signInWithPassword } from '@/http/sign-in-with-password'

const signInSchema = z.object({
    email: z.email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
})

export async function signInWithEmailAndPassword(data: FormData) {
    const entries = Object.fromEntries(data.entries())
    
    const result = signInSchema.safeParse(entries)
    
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        
        return { success: false, message: null, errors }
    }

    const { email, password } = result.data

    try {
        const { token} = await signInWithPassword({
            email, password,
        })  
        
        const cookieStore = await cookies();
        cookieStore.set('token', token, 
            { 
                path: '/',
                maxAge: 60 * 60 * 24 * 7,
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


