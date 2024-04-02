import faker from 'faker'
import { mockRoles } from './role'
import { mockPosters } from './poster'
import { Tenant } from '~/types/entities/Tenant.entity'
import useUtils from '~/composables/common/useUtils'

export const tenantMockTemplate = (
    config: Partial<Tenant> = { id: faker.datatype.number() }
): Tenant => {
    const { getServerUrl } = useUtils()
    return {
        id: faker.datatype.number(),
        name: faker.company.companyName(),
        host: getServerUrl(),
        roles: config.roles
            ? []
            : mockRoles(faker.datatype.number(10), {
                  tenantId: config.id ?? faker.datatype.number(),
              }),
        published: true,
        superadminEmail: faker.internet.email(),
        theme: config.theme ?? {
            id: faker.datatype.number(),
            tenantId: config.id as unknown as string,
            name: faker.company.companyName(),
            defaultURL: faker.internet.url(),
            customURL: faker.internet.url(),
            superadmin: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                password: faker.internet.password(),
                email: faker.internet.email(),
            },
            css: {
                primaryColor: faker.internet.color(),
                secondaryColor: faker.internet.color(),
                tertiaryColor: faker.internet.color(),
            },
            images: {
                primaryLogo: faker.image.business(200),
                secondaryLogo: faker.image.business(200),
                primaryLogoClasses: undefined,
                secondaryLogoClasses: undefined,
                authLayoutBackground: faker.image.city(),
            },
            information: {
                contactSupportUrl: faker.internet.url(),
                imprintUrl: faker.internet.url(),
                privacyPolicyUrl: faker.internet.url(),
            },
            appContent: {
                backToHomeButtonText: 'Rentrer à la Maison ;)',
                registerButtonText: 'Register',
                appTopBarText: 'You must like PosterLab',
                galleryUploadButtonText: 'Add some Docs here',
                uploadDocumentPageText: 'Dude, just upload something',
                indexPage: {
                    body: faker.lorem.paragraphs(),
                    title: faker.hacker.phrase(),
                    image: faker.image.nature(),
                },
                profileUploadPosterCard: {
                    body: faker.lorem.paragraphs(),
                    title: faker.hacker.phrase(),
                },
                homePageText: {
                    body: faker.lorem.paragraphs(),
                    title: faker.hacker.phrase(),
                },
                autocompleteTopics: [{ text: faker.lorem.word() }],
            },
            features: {
                id: faker.datatype.number(),
                AccessControl: faker.datatype.boolean(),
                TenantManagement: faker.datatype.boolean(),
            },
            settings: {
                everyoneCanEditOnlineSessionLink: faker.datatype.boolean(),
                galleryPublicVisibility: faker.datatype.boolean(),
                galleryOrganizationVisibility: faker.datatype.boolean(),
                showWorkspace: faker.datatype.boolean(),
            },
        },
        features: config.features ?? {
            id: faker.datatype.number(),
            AccessControl: faker.datatype.boolean(),
            TenantManagement: faker.datatype.boolean(),
        },
        posters:
            config.posters ??
            mockPosters(faker.datatype.number(), {
                tenant: { id: config.id ?? faker.datatype.number() } as Tenant,
            }),
        ...config,
    }
}
export const mockTenants = (count = 1): Tenant[] => {
    const tenants: Tenant[] = []

    for (let index = 0; index < count; index++) {
        const tenant = tenantMockTemplate()
        tenants.push(tenant)
    }
    return tenants
}
