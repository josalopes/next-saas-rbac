import { AbilityBuilder } from "@casl/ability"
import { AppAbility } from "."
import { User } from "./models/user"
import { Role } from "./subjects/roles"

// type Role = 'ADMIN' | 'MEMBER'

type PermissionsByRole = (
    user: User,
    builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
    ADMIN: (_, builder) => {
        builder.can('manage', 'all')
    },
    MEMBER: (_, builder) => {
        // builder.can('invite', 'User'),
        builder.can('create', 'Project')
    },
    BILLING: () => {
        
    }
}