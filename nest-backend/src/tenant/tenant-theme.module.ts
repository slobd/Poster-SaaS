import { CmsModule } from '@/cms/cms.module'
import { Module } from '@nestjs/common'
import { TenantThemeService } from './tenant-theme.service'
import { HttpModule } from '@nestjs/axios'

@Module({
    imports: [HttpModule, CmsModule],
    controllers: [],
    providers: [TenantThemeService],
    exports: [TenantThemeService],
})
export class TenantThemeModule {}
