import { ability, getCurrentOrg } from "@/auth/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { getMembers } from "@/http/get-members"
import { getMembership } from "@/http/get-membership"
import { getOrganization } from "@/http/get-organization"
import { organizationSchema } from "@saas/auth"
import { ArrowLeftRight, Crown, UserMinus } from "lucide-react"
import Image from "next/image"
import { removeMemberAction } from "./actions"
import { UpdateMemberRoleSelect } from "./update-member-role-select"

export default async function MemberList() {
    const currentOrg = await getCurrentOrg()
    const permissions = await ability()

    const [{ members }, {membership }, { organizacao }] = await Promise.all([
        getMembers(currentOrg!),
        getMembership(currentOrg!),
        getOrganization(currentOrg!)
    ])

    const authOrganization = organizationSchema.parse(organizacao)

    return (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold">Membros</h2>

            <div className="rounded border">
                <Table>
                  <TableBody>
                    {members.map((member) => {
                        return (
                            <TableRow key={member.id}>
                                <TableCell className="py-2.5" style={{ width: 48 }}>
                                    <Avatar>
                                        <AvatarFallback />
                                        {member.avatarUrl && (
                                            <Image
                                              src={member.avatarUrl} 
                                              width={32}
                                              height={32}
                                              alt=""
                                              className="aspect-square size-full"
                                            />
                                        )}
                                    </Avatar>
                                </TableCell>

                                <TableCell className="py-2.5">
                                    <div className="flex flex-col">
                                        <span className="inline-flex items-center gap-2 font-medium">
                                            {member.name}
                                            {member.userId === membership.userid && ' (eu)'}
                                            {organizacao.ownerId === member.userId && (
                                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Crown className="size-3" />
                                                    Dono
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{member.email}</span>
                                    </div>
                                </TableCell>

                                <TableCell className="py-2.5">
                                    <div className="flex items-center justify-end gap-2">
                                        {permissions?.can('transfer_ownership', authOrganization) && (
                                            <Button size="sm" variant="ghost">
                                                <ArrowLeftRight className="size-4 mr-2"/>
                                                Transferir organização
                                            </Button>
                                        )}

                                        <UpdateMemberRoleSelect
                                            memberId={member.id}
                                            value={member.role}
                                            disabled={
                                                member.userId === membership.userid ||
                                                organizacao.ownerId === member.userId ||
                                                permissions?.cannot('update', 'User')
                                            }
                                        />

                                        {permissions?.can('delete', 'User') && (
                                            <form action={removeMemberAction.bind(null, member.id)}>
                                                <Button 
                                                    disabled={
                                                        member.userId === membership.userid ||
                                                        organizacao.ownerId === member.userId
                                                    } 
                                                    type="submit" 
                                                    size="sm" 
                                                    variant="destructive"
                                                >
                                                    <UserMinus className="size-4 mr-2"/>
                                                    Remover
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                  </TableBody>  
                </Table>
            </div>
        </div>
    )
}