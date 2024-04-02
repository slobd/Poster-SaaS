import { Injectable, Scope } from '@nestjs/common'
import { CreateTenantDto } from '../dto/create-tenant.dto'
import { TenantService } from '../tenant.service'
import { TenantRepository } from '../tenant.repository'
import {
    DefaultRolesService,
    TenantRoleEnum,
} from '@/access-control/roles/default-roles.service'
import {
    Prisma,
    Tenant,
    User,
    WorkspaceVisibilityEnum,
    IdentityProvider,
} from '@prisma/client'
import { UsersRolesService } from '@/access-control/users-roles/users-roles.service'
import { WorkspaceService } from '@/workspace/workspace.service'
import { ProjectRepository } from '@/project/project.repository'
import { IdentityProviderRepository } from '@/identity-provider/identity-provider.repository'
import { PrismaService } from '@/prisma/prisma.service'
import { PublicInviteHandler } from '@/iam/invite/handlers/public-invite.handler'

@Injectable({ scope: Scope.REQUEST })
export class TenantCmsPostHandler {
    private tenant?: Tenant = null
    private data: CreateTenantDto

    constructor(
        private readonly tenantService: TenantService,
        private readonly tenantRepository: TenantRepository,
        private readonly defaultRolesService: DefaultRolesService,
        private readonly usersRolesService: UsersRolesService,
        private readonly workspaceService: WorkspaceService,
        private readonly projectRepository: ProjectRepository,
        private readonly identityProviderRepository: IdentityProviderRepository,
        private readonly prisma: PrismaService,
        private readonly publicInviteHandler: PublicInviteHandler,
    ) {}

    async handle(data: CreateTenantDto): Promise<Tenant> {
        // console.log(data)
        this.data = data

        await this.createTenant()

        return this.tenant
    }

    private async createTenant(): Promise<void> {
        const allTenantIdps = await this.createDefaultIdentityProviders()

        const localIdp = await this.identityProviderRepository.findOne({
            name: 'local',
        })

        const owner: User = await this.tenantService.findOrCreateOwner(
            this.data.superadmin,
            localIdp,
        )

        const tenantData = this.createTenantObject(owner)

        this.tenant = await this.tenantRepository.create(tenantData)

        await this.createDefaultUserDirectory(owner, allTenantIdps)

        const roles = await this.defaultRolesService.createTenantRoles(
            this.tenant,
        )

        const ownerRole = roles.find((r) => r.name === TenantRoleEnum.OWNER)

        await this.usersRolesService.giveRoleToUser(owner.id, ownerRole.id)

        const workspace = await this.workspaceService.create(
            {
                name: this.tenant.name,
                description:
                    'Welcome to your new collaboration space. In our app, the Workspace is the place to share, monitor, and track R&D projects with your partners',
                visibility: WorkspaceVisibilityEnum.PUBLIC,
                tenant: this.tenant,
                users: [owner],
            },
            owner,
        )

        // console.log('DEFAULT WORKSPACE CREATED:', workspace)

        await this.projectRepository.create({
            name: 'Project',
            workspaceId: workspace.id,
            ownerId: owner.id,
        })

        // console.log('DEFAULT PROJECT CREATED:', project)

        await this.publicInviteHandler.create({ workspaceId: workspace.id })
        // console.log('DEFAULT PUBLIC INVITE CREATED:')
    }

    private createTenantObject(owner: User): Prisma.TenantCreateInput {
        const tenant: Prisma.TenantCreateInput = {
            name: this.data.name,
            host: this.data.host,
            enabled: this.data.enabled,
            themeId: this.data.themeId,
            features: {
                create: this.data.features,
            },
            owner: {
                connect: {
                    id: owner.id,
                },
            },
            domain: this.data.domain,
        }

        if (this.data.logo)
            tenant.logo = {
                connect: {
                    id: this.data.logo.id,
                },
            }

        return tenant
    }

    private async createDefaultIdentityProviders(): Promise<
        IdentityProvider[]
    > {
        // Check for an idp with tenant domain.
        const idp: IdentityProvider[] = []
        let domains: string[] = []
        if (this.data.domain) domains = this.data.domain.split(',')

        for (const domain of domains) {
            const existingIdp = await this.identityProviderRepository.findOne({
                domain: domain,
            })

            if (existingIdp) {
                idp.push(existingIdp)
            } else {
                const newIdp = await this.identityProviderRepository.create({
                    name: this.data.name + '_' + domain + '_idp',
                    domain: domain,
                    userAccount: undefined,
                    userDirectory: undefined,
                })
                idp.push(newIdp)
            }
        }

        return idp
    }

    private async createDefaultUserDirectory(
        ownerUser: User,
        allTenantIdp: IdentityProvider[],
    ) {
        return this.prisma.userDirectory.create({
            data: {
                domain: this.data.domain,
                users: {
                    connect: {
                        id: ownerUser.id,
                    },
                },
                tenant: {
                    connect: {
                        id: this.tenant.id,
                    },
                },
                identityProvider:
                    allTenantIdp.length > 0
                        ? {
                              connect: allTenantIdp.map((idp) => ({
                                  id: idp.id,
                              })),
                          }
                        : undefined,
            },
        })
    }
}
