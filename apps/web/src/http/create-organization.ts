import { api } from "./api-client";


interface CreateOrganizationRequest {
    name: string,
    domain: string | null,
    shouldAttachUsersByDomain: boolean,
}

type CreateOrganizationResponse = void

export async function createOrganization({
    name, domain, shouldAttachUsersByDomain,
}: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
    const response = await api.post('organization', {
        json: { 
            name, 
            domain, 
            shouldAttachUsersByDomain 
        },
    })
}

