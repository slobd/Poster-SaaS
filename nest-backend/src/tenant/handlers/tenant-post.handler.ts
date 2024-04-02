import { Injectable } from '@nestjs/common'
import { TenantCmsPostHandler } from '@/tenant/handlers/tenant-cms-post.handler'
import { CmsService } from '@/cms/cms.service'
import { TenantTheme } from '@/tenant/entities/tenant-theme.entity'
import { CreateTenantDto } from '@/tenant/dto/create-tenant.dto'
import { CreateTenantAppDto } from '@/tenant/dto/create-tenant-from-web-app.dto'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { Tenant } from '@prisma/client'

@Injectable()
export class TenantPostHandler {
    constructor(
        private readonly tenantCmsPostHandler: TenantCmsPostHandler,
        private readonly cmsService: CmsService,
    ) {}

    async handle(
        body: CreateTenantAppDto,
        user: SanitizedUserDto,
    ): Promise<Tenant> {
        const cmsRequest: TenantTheme = {
            name: body.name,
            host: body.host,
            domain: body.domain,
            css: {},
            images: {},
            enabled: true,
            features: {
                AccessControl: true,
                TenantManagement: true,
                Workspace: true,
                Project: true,
                Gallery: true,
                People: true,
                Comment: true,
                Invite: true,
                Board: true,
            },
            superadmin: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
        }

        const cmsResponse = await this.cmsService.createStrapiTenant(cmsRequest)

        const saveTenantDto: CreateTenantDto = {
            name: body.name,
            host: body.host,
            enabled: cmsRequest.enabled,
            features: cmsRequest.features,
            superadmin: cmsRequest.superadmin,
            logo: body?.logo,
            themeId: cmsResponse.data.id,
            domain: body.domain,
        }

        return this.tenantCmsPostHandler.handle(saveTenantDto)
    }
}
