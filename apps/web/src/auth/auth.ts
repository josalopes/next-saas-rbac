import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getProfile } from '@/http/get-profile'
import { getMembership } from '@/http/get-membership'
import { defineAbilityFor } from '@saas/auth'

export async function isAuthenticated() {
    const authenticated = !!(await cookies()).get('token')?.value

    return authenticated
}

export async function getCurrentOrg() {
    return (await cookies()).get('org')?.value ?? null
}

export async function getCurrentMembership() {
    const org = await getCurrentOrg()

    if (!org) {
        return null
    }

    const { membership } = await getMembership(org)

    return membership
}

export async function ability() {
    const membership = await getCurrentMembership()

    if (!membership) {
        return null
    }

    const ability = defineAbilityFor({
        id: membership.userid,
        role: membership.role,
    })

    return ability
}

export async function auth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect('/auth/sign-in')
    }

    try {
        const { user } = await getProfile()

        return { user }
    } catch {
    }

    redirect('/api/auth/sign-out')
}

