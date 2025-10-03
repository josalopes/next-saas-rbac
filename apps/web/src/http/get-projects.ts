import { api } from "./api-client";

interface GetProjectsResponse {
    projects: {
        id: string
        name: string
        description: string
        slug: string
        ownerId: string
        organizationId: string
        avatarUrl: string | null
        createdAt: string
        owner: {
            id: string
            name: string | null
            avatarUrl: string | null
        }
    }[]
}

export async function getProjects(org: string) {
    const result = await api
        .get(`organization/${org}/projects`)
        .json<GetProjectsResponse>()

    return result
}