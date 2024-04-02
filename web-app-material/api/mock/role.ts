import faker from 'faker'
import { Role } from '~/types/entities/Role.entity'

export const roleMockTemplate = (_config?: Partial<Role>) => {
    return {
        id: faker.datatype.number(),
        description: faker.hacker.phrase(),
        name: faker.hacker.noun().toUpperCase(),
        tenantId: faker.datatype.number(),
        domain: 'fake',
        system: false,
    } as Role
}
// tenant: config?.tenant ?? { id: faker.datatype.number() },
//  users: config?.users ?? [],
// usersCount: config?.users?.length ?? 0,
export const mockRoles = (count = 1, config?: Partial<Role>): Role[] => {
    const roles: Role[] = []

    for (let index = 0; index < count; index++) {
        const user = roleMockTemplate(config)
        roles.push(user)
    }
    return roles
}
