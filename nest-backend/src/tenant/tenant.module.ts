import { CmsModule } from '@/cms/cms.module'
import { UsersModule } from '@/iam/users/users.module'
import { MailModule } from '@/mail/mail.module'
import { Module } from '@nestjs/common'
import { TenantGetHandler } from './handlers/tenant-get.handler'
import { TenantPatchHandler } from './handlers/tenant-patch.handler'
import { TenantCmsPatchHandler } from './handlers/tenant-cms-patch.handler'
import { TenantPostHandler } from './handlers/tenant-post.handler'
import { TenantCmsPostHandler } from './handlers/tenant-cms-post.handler'
import { TenantThemeService } from './tenant-theme.service'
import { TenantController } from './tenant.controller'
import { TenantRepository } from './tenant.repository'
import { TenantService } from './tenant.service'
import { HttpModule } from '@nestjs/axios'
import { AccessControlModule } from '@/access-control/access-control.module'
import { TenantGetByOriginHandler } from '@/tenant/handlers/tenant-get-by-origin.handler'
import { WorkspaceModule } from '@/workspace/workspace.module'
import { ProjectModule } from '@/project/project.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { InviteModule } from '@/iam/invite/invite.module'
import { UserDirectoryModule } from '@/iam/user-directory/user-directory.module'
import { IdentityProviderModule } from '@/identity-provider/identity-provider.module'
import { UserAccountModule } from '@/iam/user-account/user-account.module'
import { TenantServiceModule } from '@/tenant/tenant-service.module'
import { AzureModule } from '@/azure/azure.module'

@Module({
    imports: [
        HttpModule,
        UsersModule,
        CmsModule,
        MailModule,
        AccessControlModule,
        // If we use events the direct dependency is removed
        WorkspaceModule,
        ProjectModule,
        InviteModule,
        UserDirectoryModule,
        IdentityProviderModule,
        UserAccountModule,
        TenantServiceModule,
        AzureModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: '1d',
                    },
                }
            },
        }),
    ],
    controllers: [TenantController],
    providers: [
        TenantRepository,
        TenantService,
        TenantThemeService,
        TenantGetHandler,
        TenantGetByOriginHandler,
        TenantPostHandler,
        TenantCmsPostHandler,
        TenantPatchHandler,
        TenantCmsPatchHandler,
    ],
    exports: [TenantService, TenantThemeService, TenantRepository],
})
export class TenantModule {}
