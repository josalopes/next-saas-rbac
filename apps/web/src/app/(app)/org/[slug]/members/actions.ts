'use server'

import { removeMember } from "@/http/remove-member"
import { revokeInvite } from "@/http/revoke-invite"
import { updateMember } from "@/http/update-member"
import { Role, roleSchema } from "@saas/auth"
import { revalidateTag } from "next/cache"

import { z } from 'zod'
import { HTTPError } from 'ky'

import { getCurrentOrg } from '@/auth/auth'
import { createInvite } from "@/http/create-invite"

const inviteSchema = z.object({
    email: z.email({ message: 'E-mail inválido' }),
    role: roleSchema,
})

export async function createInviteAction(data: FormData) {
    const entries = Object.fromEntries(data.entries())
    const result = inviteSchema.safeParse(entries)

    const currentOrg = await getCurrentOrg();
    
    if (!result.success) {
        const errors = result.error.flatten().fieldErrors
        
        return { success: false, message: null, errors }
    }

    const { email, role } = result.data

    try {
        

        await createInvite({
            org: currentOrg!,
            email,
            role,
        })

        revalidateTag(`${currentOrg}/invites`)
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

    return { success: true, message: 'Convite criado com sucesso', errors: null }
}

export async function removeMemberAction(memberId: string) {
  const currentOrg = await getCurrentOrg()

  await removeMember({
    org: currentOrg!,
    memberId
  })

  revalidateTag(`${currentOrg}/members`)
}

export async function updateMemberAction(memberId: string, role: Role) {
  const currentOrg = await getCurrentOrg()

  await updateMember({
    org: currentOrg!,
    memberId,
    role
  })

  revalidateTag(`${currentOrg}/members`)
}

export async function revokeInviteAction(inviteId: string) {
  const currentOrg = await getCurrentOrg()

  await revokeInvite({
    org: currentOrg!,
    inviteId,
  })

  revalidateTag(`${currentOrg}/invites`)
}