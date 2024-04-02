import { UsersModule } from '@/iam/users/users.module'
import { Module } from '@nestjs/common'
import { TenantService } from './tenant.service'
import { HttpModule } from '@nestjs/axios'
import { AccessControlModule } from '@/access-control/access-control.module'
import { UserDirectoryModule } from '@/iam/user-directory/user-directory.module'
import { UserAccountModule } from '@/iam/user-account/user-account.module'
import { AzureModule } from '@/azure/azure.module'

@Module({
    imports: [
        HttpModule,
        // UsersService
        UsersModule,
        // UsersRolesService
        AccessControlModule,
        // UserDirectoryService
        UserDirectoryModule,
        // UserAccountService, UserAccountRepository
        UserAccountModule,
        // AzureUserService
        AzureModule,
    ],
    controllers: [],
    providers: [TenantService],
    exports: [TenantService],
})
export class TenantServiceModule {}
