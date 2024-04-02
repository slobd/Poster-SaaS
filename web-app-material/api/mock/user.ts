import faker from 'faker'
import { mockImageTemplate } from './shared'
import { mockPosters } from './poster'
import { mockComments } from './comment'
import { User } from '~/types/entities/User.entity'
import { Tenant } from '~/types/entities/Tenant.entity'

export const userMockTemplate = (config = {} as Partial<User>): User => {
    const userId = faker.datatype.number()
    return {
        id: faker.datatype.number(),
        isDummyUser: false,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        confirmed: faker.datatype.boolean(),
        email: faker.internet.email(),
        disableNotifications: faker.datatype.boolean(),
        termOfUse: faker.datatype.boolean(),
        organizationName: faker.company.companyName(),
        privacyPolicy: faker.datatype.boolean(),
        subscribed: faker.datatype.boolean(),
        avatar: mockImageTemplate('avatar'),
        posters:
            config.posters ??
            mockPosters(faker.datatype.number({ min: 5, max: 10 }), {
                user: { id: userId } as User,
                authors: [{ id: userId } as User],
                tenant: { id: faker.datatype.number() } as Tenant,
            }),
        authoredPosters:
            config.authoredPosters ??
            mockPosters(faker.datatype.number({ min: 10, max: 15 }), {
                user: { id: userId } as User,
                authors: [{ id: userId } as User],
                tenant: { id: faker.datatype.number() } as Tenant,
            }),
        password: faker.internet.password(),
        workspaceSelected: faker.datatype.boolean(),
        comments:
            config.comments ??
            mockComments(faker.datatype.number({ min: 4, max: 8 }), {
                poster: config?.posters?.length ? config.posters[0] : undefined,
            }),
        roles: [],
        ...config,
    } as User
}

export const mockUsers = (count = 1, config?: Partial<User>): User[] => {
    const users: User[] = []

    for (let index = 0; index < count; index++) {
        const user = userMockTemplate(config)
        users.push(user)
    }
    return users
}
