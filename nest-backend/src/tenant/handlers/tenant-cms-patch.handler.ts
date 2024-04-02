import { Injectable, NotFoundException, Scope } from '@nestjs/common'
import { TenantService } from '../tenant.service'
import { UpdateTenantDto } from '../dto/update-tenant.dto'
import { UsersRolesService } from '@/access-control/users-roles/users-roles.service'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, Role, Tenant, User } from '@prisma/client'
import {
    TenantWithFeatures,
    TenantWithFeaturesAndOwner,
} from '@/tenant/tenant.repository'
import { merge, omit, without } from 'lodash'
import { TenantRoleEnum } from '@/access-control/roles/default-roles.service'
import { RoleDomain } from '@/access-control/rules/rules.constants'
import { IdentityProviderRepository } from '@/identity-provider/identity-provider.repository'

@Injectable({ scope: Scope.REQUEST })
export class TenantCmsPatchHandler {
    private tenant?: TenantWithFeaturesAndOwner = null
    private data: UpdateTenantDto

    constructor(
        private readonly tenantService: TenantService,
        private readonly usersRolesService: UsersRolesService,
        private readonly identityProviderRepository: IdentityProviderRepository,
        private readonly prisma: PrismaService,
    ) {}

    async handle(data: UpdateTenantDto, id: number): Promise<Tenant> {
        this.data = data

        // TODO: Refactor to tenant.repository
        this.tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                features: true,
                owner: true,
            },
        })

        if (!this.tenant) {
            throw new NotFoundException()
        }

        await this.updateTenant()

        return this.tenant
    }

    private async updateTenant(): Promise<void> {
        const allTenantIdps = await this.prisma.identityProvider.findMany({
            where: {
                userDirectory: {
                    tenantId: this.tenant.id,
                },
            },
        })

        let userIdp = allTenantIdps.find(
            (idp) => idp.domain === this.data.superadmin.email.split('@')[1],
        )

        if (!userIdp)
            userIdp = await this.identityProviderRepository.findOne({
                name: 'local',
            })

        const owner: User = await this.tenantService.findOrCreateOwner(
            this.data.superadmin,
            userIdp,
        )

        if (this.shouldUpdateTenantOwner()) {
            await this.updateTenantOwner(owner)
        }
        let updatedDomain = ''
        if (this.tenant.domain !== this.data.domain) {
            updatedDomain = await this.validateAndManageDomains(
                this.tenant.domain,
                this.data.domain,
            )
        }

        const tenantToUpdate = this.modifyTenantFields(this.tenant, owner)
        if (updatedDomain) {
            const oldDomain = this.tenant.domain ? `${this.tenant.domain},` : ''
            tenantToUpdate.domain = `${oldDomain}${updatedDomain}`
        }
        await this.prisma.tenant.update({
            where: {
                id: this.tenant.id,
            },
            data: tenantToUpdate,
        })
    }

    private shouldUpdateTenantOwner(): boolean {
        return (
            this.data.superadmin &&
            this.tenant.owner.email !== this.data.superadmin.email
        )
    }

    private async updateTenantOwner(owner: User): Promise<void> {
        const role = await this.prisma.role.findUnique({
            where: {
                name_tenantId_domain: {
                    name: TenantRoleEnum.OWNER,
                    domain: RoleDomain.Tenant(this.tenant.id),
                    tenantId: this.tenant.id,
                },
            },
        })

        await this.removeRoleFromCurrentAdmin(role)

        await this.usersRolesService.giveRoleToUser(owner.id, role.id)
    }

    private async removeRoleFromCurrentAdmin(adminRole: Role): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { email: this.tenant.owner.email },
        })

        await this.usersRolesService.deleteRoleFromUser(user.id, adminRole.id)
    }

    private modifyTenantFields(
        tenant: TenantWithFeatures,
        newOwner: User,
    ): Prisma.TenantUpdateInput {
        const tenantUpdate: Prisma.TenantUpdateInput = {
            name: this.data.name,
            host: this.data.host,
            enabled: this.data.enabled,
            // ...tenant,
            // ...omit(this.data, ['superadmin']),
            features: {
                update: {
                    ...omit(tenant.features, ['tenantId']),
                    ...this.data.features,
                },
            },
        }

        if (this.shouldUpdateTenantOwner()) {
            tenantUpdate.owner = {
                connect: {
                    id: newOwner.id,
                },
            }
        }

        return tenantUpdate
    }

    private async validateAndManageDomains(
        oldDomains: string,
        newDomains: string,
    ): Promise<string> {
        if (!oldDomains || newDomains.includes(oldDomains)) {
            const domainList = newDomains.replace(oldDomains, '').split(',')
            const newDomainList = without(domainList, '')
            if (newDomainList.length > 0) {
                const { idpList, domainString } = await this.creatNewIdp(
                    newDomainList,
                )
                await this.updateUserDirectory(idpList, newDomains)
                return domainString
            }
        }
        return
    }

    private async creatNewIdp(
        newDomainList: string[],
    ): Promise<{ idpList: any[]; domainString: string }> {
        const newIdpList: any[] = []
        let newIdpString = ''
        for (const domain of newDomainList) {
            const existingIdp = await this.prisma.identityProvider.findUnique({
                where: {
                    domain: domain,
                },
            })
            if (!existingIdp) {
                const newIdp = await this.identityProviderRepository.create({
                    name: this.tenant.name + '_' + domain + '_idp',
                    domain: domain,
                })
                newIdpList.push({ id: newIdp.id })
                newIdpString = newIdpString + domain + ','
            }
        }
        if (newIdpString) newIdpString = newIdpString.slice(0, -1)
        return { idpList: newIdpList, domainString: newIdpString }
    }

    private async updateUserDirectory(
        idpList: any[],
        newDomains: string,
    ): Promise<void> {
        const userDirectory = await this.prisma.userDirectory.findUnique({
            where: {
                tenantId: this.tenant.id,
            },
            include: {
                identityProvider: true,
            },
        })

        if (userDirectory) {
            const updatedIdpList = merge(
                userDirectory.identityProvider.map((x) => {
                    return { id: x.id }
                }),
                idpList,
            )
            await this.prisma.userDirectory.update({
                where: {
                    id: userDirectory.id,
                },
                data: {
                    domain: newDomains,
                    identityProvider: {
                        set: [],
                        connect: updatedIdpList,
                    },
                },
            })
        }
    }
}
