import z from 'zod'
import { 
  createMongoAbility, 
  CreateAbility, 
  MongoAbility, 
  AbilityBuilder 
} from '@casl/ability'
import { permissions } from './permissions'
import { User } from './models/user'
import { projectSubject } from './subjects/project';
import { organizationSubject } from './subjects/organization'
import { inviteSubject } from './subjects/invite'
import { billingSubject } from './subjects/billing'
import { userSubject } from './subjects/user';

// export { organizationSchema } from './models/organization'
// export { projectSchema } from './models/project'
// export { userSchema } from './models/user'
// export * from './roles'

export * from './models/organization'
export * from './models/project'
export * from './models/user'
export * from './roles'

const appAbilitiesSchema = z.union([
  projectSubject,
  userSubject,
  organizationSubject,
  inviteSubject,
  billingSubject,
  z.tuple([
    z.literal('manage'),
    z.literal('all')
  ])
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>;

export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilityFor(user: User) {
  const { can, cannot, build } = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error(`Permissions for role ${user.role} not found`)
  }

  permissions[user.role](user, { can, cannot })

  const ability = build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  ability.can = ability.can.bind(ability)
  ability.cannot = ability.cannot.bind(ability)

  return ability
}
