import { api } from "./api-client";


interface UpdateOrganizationRequest {
    org: string,
    name: string,
    domain: string | null,
    shouldAttachUsersByDomain: boolean,
}

type CreateOrganizationResponse = void

export async function updateOrganization({
    org, name, domain, shouldAttachUsersByDomain,
}: UpdateOrganizationRequest): Promise<CreateOrganizationResponse> {
    const response = await api.put(`organization/${org}`, {
        json: { 
            name, 
            domain, 
            shouldAttachUsersByDomain 
        },
    })
}

