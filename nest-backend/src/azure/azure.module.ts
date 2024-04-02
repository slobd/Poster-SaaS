import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { AzureActiveDirectoryB2CService } from '@/azure/azure-active-directory-b2c.service'
import { AzureUserService } from '@/azure/azure-user.service'
import { AzureController } from './azure.controller'
// import { BaseAzureService } from "@/azure/base-azure.service";

@Module({
    imports: [HttpModule],
    controllers: [AzureController],
    providers: [AzureActiveDirectoryB2CService, AzureUserService],
    exports: [AzureActiveDirectoryB2CService, AzureUserService],
})
export class AzureModule {}
