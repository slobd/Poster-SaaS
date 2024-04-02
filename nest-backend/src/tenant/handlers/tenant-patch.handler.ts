import { Injectable } from '@nestjs/common'
import { DeepPartial } from 'typeorm'
import { TenantTheme } from '@/tenant/entities/tenant-theme.entity'
import { UpdateTenantDto } from '@/tenant/dto/update-tenant.dto'
import { UpdateTenantFromWebAppDto } from '@/tenant/dto/update-tenant-from-web-app.dto'
import { TenantCmsPatchHandler } from '@/tenant/handlers/tenant-cms-patch.handler'
import { CmsService } from '@/cms/cms.service'
import { TenantRepository } from '@/tenant/tenant.repository'
import { Tenant } from '@prisma/client'

@Injectable()
export class TenantPatchHandler {
    constructor(
        private readonly tenantCmsPatchHandler: TenantCmsPatchHandler,
        private readonly cmsService: CmsService,
        private readonly tenantRepository: TenantRepository,
    ) {}

    async handle(body: UpdateTenantFromWebAppDto, id: number): Promise<Tenant> {
        const tenant = await this.tenantRepository.findOneById(id)

        const cmsRequest: DeepPartial<TenantTheme> = body

        await this.cmsService.updateStrapiTenant(tenant.themeId, cmsRequest)

        const updateTenantDto: UpdateTenantDto = {
            name: body.name,
        }

        return await this.tenantCmsPatchHandler.handle(updateTenantDto, id)
    }
}
