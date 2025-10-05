import { api } from "./api-client";

interface RemoveInviteRequest {
    org: string,
    inviteId: string
}

export async function revokeInvite({
    org,
    inviteId
}: RemoveInviteRequest) {
    await api.delete(`organization/${org}/invites/${inviteId}`)

}