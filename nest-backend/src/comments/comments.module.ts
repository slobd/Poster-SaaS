import { MailModule } from '@/mail/mail.module'
import { Module } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { UsersModule } from '@/iam/users/users.module'
import { TenantModule } from '@/tenant/tenant.module'

@Module({
    imports: [MailModule, UsersModule, TenantModule],
    providers: [CommentsService],
    controllers: [CommentsController],
})
export class CommentsModule {}
