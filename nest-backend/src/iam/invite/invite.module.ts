import { Module } from '@nestjs/common'
import { PrivateInviteHandler } from '@/iam/invite/handlers/private-invite.handler'
import { InviteController } from '@/iam/invite/invite.controller'
import { MailModule } from '@/mail/mail.module'
import { PublicInviteHandler } from '@/iam/invite/handlers/public-invite.handler'
import { InviteAcceptHandler } from '@/iam/invite/handlers/invite-accept.handler'
import { InviteRepository } from '@/iam/invite/invite.repository'
import { InviteService } from '@/iam/invite/invite.service'
import { UserDirectoryModule } from '@/iam/user-directory/user-directory.module'
import { TenantServiceModule } from '@/tenant/tenant-service.module'
import { WorkspacesUsersService } from '@/workspace/workspace-users/workspaces-users.service'
import { WorkspaceRepository } from '@/workspace/workspace.repository'

@Module({
    imports: [MailModule, UserDirectoryModule, TenantServiceModule],
    controllers: [InviteController],
    providers: [
        PrivateInviteHandler,
        PublicInviteHandler,
        InviteAcceptHandler,
        InviteRepository,
        InviteService,
        //TODO: Fix cyclic dependency with workspace module
        WorkspacesUsersService,
        WorkspaceRepository,
    ],
    exports: [InviteService, InviteRepository, PublicInviteHandler],
})
export class InviteModule {}
