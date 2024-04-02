import { Module } from '@nestjs/common'
import { PostersController } from './posters.controller'
import { PostersService } from './posters.service'
import { UploadsModule } from '@/uploads/uploads.module'
import { UsersModule } from '@/iam/users/users.module'
import { MailModule } from '@/mail/mail.module'
import { TenantModule } from '@/tenant/tenant.module'
import { AwsModule } from '@/aws/aws.module'

import { PosterRepository } from '@/posters/poster.repository'
import { PostersGetHandler } from '@/posters/handlers/posters-get.handler'
import { PostersDeleteHandler } from '@/posters/handlers/posters-delete.handler'
import { PostersPostHandler } from '@/posters/handlers/posters-post.handler'
import { PostersGetOneHandler } from '@/posters/handlers/posters-get-one.handler'
import { PostersPatchHandler } from '@/posters/handlers/posters-patch.handler'

@Module({
    imports: [UploadsModule, UsersModule, MailModule, TenantModule, AwsModule],
    controllers: [PostersController],
    providers: [
        PosterRepository,
        PostersService,
        PostersGetOneHandler,
        PostersGetHandler,
        PostersPostHandler,
        PostersPatchHandler,
        PostersDeleteHandler,
    ],
})
export class PostersModule {}
