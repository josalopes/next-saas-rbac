import { api } from "./api-client";

export async function acceptInvite(inviteId: string) {    
    const response = await api.post(`invites/${inviteId}/accept`)
}

