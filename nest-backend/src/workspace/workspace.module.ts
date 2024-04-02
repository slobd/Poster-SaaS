import { CacheModule, Module } from '@nestjs/common'
import { WorkspaceService } from '@/workspace/workspace.service'
import { WorkspaceRepository } from '@/workspace/workspace.repository'
import { AccessControlModule } from '@/access-control/access-control.module'
import { WorkspaceController } from '@/workspace/workspace.controller'
import { WorkspacesGetOneHandler } from '@/workspace/handlers/workspaces-get-one.handler'
import { WorkspacesPatchHandler } from '@/workspace/handlers/workspaces-patch.handler'
import { WorkspacesUsersService } from '@/workspace/workspace-users/workspaces-users.service'
import { WorkspacesUsersController } from '@/workspace/workspace-users/workspaces-users.controller'
import { UsersModule } from '@/iam/users/users.module'
import { WorkspacePeopleController } from '@/workspace/workspace-people/workspace-people.controller'
import { WorkspacePeopleService } from '@/workspace/workspace-people/workspace-people.service'
import { WorkspacesPostHandler } from '@/workspace/handlers/workspaces-post.handler'
import { ProjectModule } from '@/project/project.module'
import { WorkspacesGetHandler } from '@/workspace/handlers/workspaces-get.handler'
import { WorkspacesUsersPatchHandler } from '@/workspace/workspace-users/handlers/workspaces-users-patch.handler'
import { MailModule } from '@/mail/mail.module'
import { WorkspacesDeleteHandler } from './handlers/worksapce-delete.handler'
import { InviteModule } from '@/iam/invite/invite.module'

@Module({
    imports: [
        AccessControlModule,
        UsersModule,
        CacheModule.register({
            ttl: 5, // seconds
        }),
        ProjectModule,
        MailModule,
        InviteModule,
    ],
    providers: [
        WorkspaceService,
        WorkspacesUsersService,
        WorkspacePeopleService,
        WorkspaceRepository,
        WorkspacesGetOneHandler,
        WorkspacesPatchHandler,
        WorkspacesPostHandler,
        WorkspacesGetHandler,
        WorkspacesDeleteHandler,
        WorkspacesUsersPatchHandler,
    ],
    controllers: [
        WorkspacesUsersController,
        WorkspacePeopleController,
        WorkspaceController,
    ],
    exports: [WorkspaceService, WorkspacesUsersService, WorkspacePeopleService],
})
export class WorkspaceModule {}
