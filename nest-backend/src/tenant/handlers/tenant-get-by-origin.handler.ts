import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { Tenant as TenantEntity } from '@/tenant/entities/tenant.entity'
import { TenantTheme } from '@/tenant/entities/tenant-theme.entity'
import { TenantThemeService } from '@/tenant/tenant-theme.service'
import { TenantRepository } from '@/tenant/tenant.repository'
import { Tenant } from '@prisma/client'

@Injectable()
export class TenantGetByOriginHandler {
    constructor(
        private readonly tenantThemeService: TenantThemeService,
        private readonly tenantRepository: TenantRepository,
    ) {}

    async handle(origin: string): Promise<Tenant> {
        if (!origin) throw new BadRequestException('No origin header')

        const tenant: TenantEntity =
            await this.tenantRepository.findTenantByOrigin(origin)

        if (!tenant)
            throw new NotFoundException(
                'No tenant was found for the given host',
            )

        const theme = await this.tenantThemeService.findTenantTheme(tenant)

        if (theme) tenant.theme = theme as TenantTheme
        /**
         * Set default primaryLogo if not present
         */
        if (!tenant.theme.images.primaryLogo)
            tenant.theme.images.primaryLogo = 'PosterLabLogo.svg'

        return tenant
    }
}
