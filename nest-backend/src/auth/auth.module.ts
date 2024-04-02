import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersModule } from '@/iam/users/users.module'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { JwtModule } from '@nestjs/jwt'
import { JwtStrategy } from './strategies/jwt.strategy'
import { ConfigService } from '@nestjs/config'
import { MailModule } from '@/mail/mail.module'
import { TenantModule } from '@/tenant/tenant.module'
import { UploadsModule } from '@/uploads/uploads.module'
import { AzureModule } from '@/azure/azure.module'
import { AuthProfilePatchHandler } from '@/auth/handlers/auth-profile-patch.handler'
import { RedirectUriHandler } from '@/auth/handlers/redirect-uri.handler'
import { WorkspaceModule } from '@/workspace/workspace.module'
import { UserDirectoryModule } from '@/iam/user-directory/user-directory.module'
import { InviteModule } from '@/iam/invite/invite.module'
import { IdentityProviderModule } from '@/identity-provider/identity-provider.module'

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => TenantModule),
        PassportModule,
        MailModule,
        UploadsModule,
        AzureModule,
        WorkspaceModule,
        UserDirectoryModule,
        InviteModule,
        IdentityProviderModule,
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
    providers: [
        AuthService,
        JwtStrategy,
        AuthProfilePatchHandler,
        RedirectUriHandler,
    ],
    controllers: [AuthController],
    exports: [JwtModule],
})
export class AuthModule {}
