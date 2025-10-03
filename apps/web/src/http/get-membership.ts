import { api } from "./api-client"
import { Role } from "@saas/auth"

interface GetMembershipResponse {
    membership: {
        id: string,
        role: Role,
        organizationId: string,
        userid: string,
    }
}

export async function getMembership(org: string){
    const result = await api.get(`organization/${org}/membership`).json<GetMembershipResponse>()

    return result
}