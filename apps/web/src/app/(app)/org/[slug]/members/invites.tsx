import { ability, getCurrentOrg } from "@/auth/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getInvites } from "@/http/get-invites"

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

import RevokeInviteButton from "./revoke-invite-button"
import { CreateInviteForm } from "./create-invite-form"

export default async function Invites() {
    const currentOrg = await getCurrentOrg()
    const permissions = await ability()

    const { invites } = await getInvites(currentOrg!)

    return (
        <div space-y-4>
            {permissions?.can('create', 'Invite') && (
                <Card>
                    <CardHeader>
                        <CardTitle>Convidar membro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CreateInviteForm />
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
            <h2 className="text-lg font-semibold">Convites</h2>

            <div className="rounded border">
                <Table>
                  <TableBody>
                    {invites.map((invite) => {
                        return (
                            <TableRow key={invite.id}>
                                <TableCell className="py-2.5">
                                    <span className="text-muted-foreground">{invite.email}</span>
                                </TableCell>

                                <TableCell className="py-2.5">
                                    {invite.role}
                                </TableCell>

                                <TableCell className="py-2.5">
                                    <div className="flex justify-end">
                                        {permissions?.can('delete', 'Invite') && (
                                            <RevokeInviteButton inviteId={invite.id} />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}

                    {invites.length === 0 && (
                        <TableRow>
                            <TableCell className="text-center text-muted-foreground">Nenhum convite encontrado</TableCell>
                        </TableRow>
                    )}
                  </TableBody>  
                </Table>
            </div>
        </div>
        </div>
    )
}