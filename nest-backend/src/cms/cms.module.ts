import { Module } from '@nestjs/common'
import { CmsService } from './cms.service'
import { HttpModule } from '@nestjs/axios'

@Module({
    imports: [HttpModule],
    providers: [CmsService],
    exports: [CmsService],
})
export class CmsModule {}
