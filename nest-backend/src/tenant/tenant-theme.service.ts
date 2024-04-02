import { Injectable } from '@nestjs/common'
import { TenantTheme } from './entities/tenant-theme.entity'
import { plainToClass } from 'class-transformer'
import { CmsService } from '@/cms/cms.service'
import { Tenant } from '@prisma/client'

@Injectable()
export class TenantThemeService {
    constructor(private readonly cmsService: CmsService) {}

    async findTenantTheme(tenant: Tenant): Promise<TenantTheme | null> {
        // Check if tenant in Pg has an identifier
        const themeIdentifier = tenant.themeId

        return this.findThemeByIdentifier(themeIdentifier)
    }

    private async findThemeByIdentifier(
        id: number,
    ): Promise<TenantTheme | null> {
        const themeRes = await this.fetchTheme(id)

        if (!themeRes) return null

        return plainToClass(TenantTheme, themeRes)
    }

    private async fetchTheme(id: number): Promise<TenantTheme> {
        const res = await this.cmsService.findOneStrapiTenant(id)

        if (Array.isArray(res.data)) {
            return res.data.length > 0 ? res.data[0] : null
        } else {
            return res.data
        }
    }
}
