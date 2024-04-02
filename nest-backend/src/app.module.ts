import 'source-map-support/register' // get source-mapped stack traces
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { AuthModule } from '@/auth/auth.module'
import { UsersModule } from '@/iam/users/users.module'
import { UploadsModule } from '@/uploads/uploads.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DatabaseModule } from './database/database.module'
import { MailModule } from './mail/mail.module'
import { AwsModule } from './aws/aws.module'
import { UtilsModule } from './utils/utils.module'
import { UserMiddleware } from './utils/middlewares/user.middleware'
import { TenantModule } from './tenant/tenant.module'
import { TenantMiddleware } from './utils/middlewares/tenant.middleware'
import { SentryModule } from '@ntegral/nestjs-sentry'
import { APP_FILTER } from '@nestjs/core'
import { AllExceptionsFilter } from './utils/filters/all-exceptions.filter'
import { LiveSessionModule } from './live-session/live-session.module'
import { TenantThemeModule } from './tenant/tenant-theme.module'
import { CmsModule } from './cms/cms.module'
import { PrismaModule } from '@/prisma/prisma.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { AccessControlModule } from './access-control/access-control.module'
import { AzureModule } from '@/azure/azure.module'
import { WorkspaceModule } from './workspace/workspace.module'
import { ProjectModule } from './project/project.module'
import { IdentityProviderModule } from '@/identity-provider/identity-provider.module'
import { PostersModule } from '@/posters/posters.module'
import { InviteModule } from '@/iam/invite/invite.module'
import { CommentsModule } from '@/comments/comments.module'
import { BoardModule } from './board/board.module'
import { TaskModule } from './task/task.module'
import { UserAccountModule } from '@/iam/user-account/user-account.module'
import { UserDirectoryModule } from '@/iam/user-directory/user-directory.module'
import { TenantServiceModule } from '@/tenant/tenant-service.module'
import { TestsModule } from './tests/tests.module'

const configModuleSettings =
    process.env.DOCKER === 'true'
        ? {
              isGlobal: true,
              ignoreEnvFile: true,
          }
        : {
              isGlobal: true,
              envFilePath:
                  process.env.NODE_ENV === 'test' ? 'test.env' : '.env',
          }

@Module({
    imports: [
        // LoggerModule.forRoot({
        //     pinoHttp: [
        //         {
        //             level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        //             prettyPrint: process.env.NODE_ENV !== 'production',
        //
        //         },
        //     ],
        // }),
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot(configModuleSettings),
        SentryModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                dsn: configService.get('SENTRY_DSN'),
                debug: configService.get('NODE_ENV') === 'development',
                environment: configService.get('NODE_ENV'),
            }),
            inject: [ConfigService],
        }),
        DatabaseModule,
        AuthModule,
        UsersModule,
        UploadsModule,
        MailModule,
        AwsModule,
        UtilsModule,
        TenantModule,
        TenantThemeModule,
        LiveSessionModule,
        CmsModule,
        PrismaModule,
        AccessControlModule,
        AzureModule,
        WorkspaceModule,
        ProjectModule,
        PostersModule,
        IdentityProviderModule,
        InviteModule,
        CommentsModule,
        BoardModule,
        TaskModule,
        UserAccountModule,
        UserDirectoryModule,
        TenantServiceModule,
        TestsModule,
    ],
    controllers: [],
    providers: [
        // SentryModule is catching errors with an interceptor
        // We should consider creating our own module
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
    exports: [DatabaseModule],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(TenantMiddleware)
            .exclude(
                { path: 'tenants', method: RequestMethod.POST },
                { path: 'tenants', method: RequestMethod.GET },
                { path: 'tenants/cms', method: RequestMethod.POST },
                { path: 'tenants/cms/:id', method: RequestMethod.PATCH },
                'tenants/by-origin',
                'auth/profile',
                'auth/confirm-email',
                'auth/redirect-uri',
                'auth/redirect-register-uri',
                'auth/reset-redirect-uri',
                'azure/users',
                'azure/users/:id',
                'azure/users/email',
                'identity-provider/email',
                'iam/invite/accept-invite',
            )
            .forRoutes('*')
        consumer.apply(UserMiddleware).forRoutes('*')
    }
}
