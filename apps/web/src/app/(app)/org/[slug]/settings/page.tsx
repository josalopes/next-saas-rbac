import { ability, getCurrentOrg } from "@/auth/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrganizationForm } from "../../organization-form"
import { Divide } from "lucide-react"
import { ShutdownOrganization } from "./shutdown-organization-button"
import { getOrganization } from "@/http/get-organization"
import { Billing } from "./billing"

export default async function Settings() {
    const currentOrg = await getCurrentOrg()
    const permissions = await ability()
    const { organizacao } = await getOrganization(currentOrg!)

    const canUpdateOrganization = permissions?.can('update', 'Organization')
    const canGetBilling = permissions?.can('get', 'Billing')
    const canShutdownOrganization = permissions?.can('delete', 'Organization')


    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold]">Configurações</h1>

            <div className="space-y-4">
                {canUpdateOrganization && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações da organização</CardTitle>
                            <CardDescription>
                                Atualizar detalhes de sua organização
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrganizationForm isUpdating initialData={{
                                name: organizacao.name,
                                domain: organizacao.domain,
                                shouldAttachUsersByDomain: organizacao.shouldAttachUsersByDomain,
                            }}/>
                        </CardContent>
                    </Card>
                )}
                
                {canGetBilling && <Billing />}

                {canShutdownOrganization && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Excluir a organização</CardTitle>
                            <CardDescription>
                                Esta ação apagará todos os dados da organização, incluindo projetos, e não poderá ser desfeita
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ShutdownOrganization />
                        </CardContent>
                    </Card>
                )}

            </div>

        </div>
    )
}