
import { Button } from "@/components/ui/button"
import { XOctagon } from "lucide-react"
import { revokeInviteAction } from "./actions"

interface RevokeInviteButtonProps {
    inviteId: string
}

export default function InviteRevokeButton({ inviteId }: RevokeInviteButtonProps) {
    return (
        <form action={revokeInviteAction.bind(null, inviteId)}>
            <Button size="sm" variant="destructive">
                <XOctagon className="size-4 mr-2" />
                Revogar convite
            </Button>
        </form>
    )
}