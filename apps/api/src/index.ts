import { defineAbilityFor } from "@saas/auth"

const ability = defineAbilityFor({ role: 'ADMIN'})

const userCanInviteSomeoneElse = ability.can('invite', 'User')
const userCanDeleteOtherUser = ability.can('delete', 'User')