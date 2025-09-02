import { defineAbilityFor, projectSchema } from "@saas/auth"

const ability = defineAbilityFor({
    role: 'ADMIN', id: 'user-id'
})

const project = projectSchema.parse({ id: 'project-id', ownerId: 'user-id' })

// const userCanInviteSomeoneElse = ability.can('invite', 'User')
console.log(ability.can('get', 'Billing'))
console.log(ability.can('create', 'Invite'))
console.log(ability.can('delete', project))