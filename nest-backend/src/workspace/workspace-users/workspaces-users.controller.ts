import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import {
    UserWithRoles,
    WorkspacesUsersService,
} from './workspaces-users.service'
import { UpdateUserRoleDto } from '@/workspace/workspace-users/dto/update-user-role.dto'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { WorkspaceUserFindMany } from '@/iam/users/user.repository'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { User } from '@/utils/decorators/user.decorator'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { ApiTags } from '@nestjs/swagger'
import { WorkspacesUsersPatchHandler } from '@/workspace/workspace-users/handlers/workspaces-users-patch.handler'

@Controller('workspaces')
@ApiTags('Workspaces - User Management')
@UseGuards(JwtAuthGuard)
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class WorkspacesUsersController {
    constructor(
        private workspacesUsersService: WorkspacesUsersService,
        private workspacesUsersPatchHandler: WorkspacesUsersPatchHandler,
    ) {}

    @Get(':id/users/:userId')
    @Policy({
        action: ActionEnum.read,
        subject: SubjectEnum.User,
        evaluateReadForListAction: false,
        informationProvider: { entity: SubjectEnum.Workspace },
    })
    async findOneUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('id', ParseIntPipe) workspaceId: number,
        @User() authenticatedUser: SanitizedUserDto,
    ): Promise<Omit<WorkspaceUserFindMany, 'workspaces'>> {
        return this.workspacesUsersService.findOneUser(userId, workspaceId, authenticatedUser)
    }

    @Get(':id/users')
    @Policy({
        action: ActionEnum.list,
        subject: SubjectEnum.User,
        evaluateReadForListAction: false,
        informationProvider: { entity: SubjectEnum.Workspace },
    })
    async findUsers(
        @Param('id', ParseIntPipe) workspaceId: number,
    ): Promise<UserWithRoles[]> {
        return this.workspacesUsersService.findUsers(workspaceId)
    }

    @Patch(':workspaceId/users/:userId')
    @Policy({
        subject: SubjectEnum.User,
        action: ActionEnum.update,
        informationProvider: {
            identifier: 'userId',
        },
    })
    async update(
        @Param('workspaceId', ParseIntPipe) workspaceId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() body: UpdateUserRoleDto,
        @User() user: SanitizedUserDto,
    ): Promise<void> {
        return this.workspacesUsersPatchHandler.handle(user, {
            roleId: body.roleId,
            userId,
            workspaceId,
        })
    }

    /**
     *  TODO: This is currently relying on AccessControl.updateUserRole (same as the route to update a role of a user)
     *        We may need to introduce a new permission in the future to handle only this route
     */
    @Delete(':workspaceId/users/:userId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @Policy({
        subject: SubjectEnum.User,
        action: ActionEnum.update,
        informationProvider: {
            identifier: 'userId',
        },
    })
    async delete(
        @Param('workspaceId', ParseIntPipe) workspaceId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @User() user: SanitizedUserDto,
    ): Promise<void> {
        return this.workspacesUsersService.removeUserFromWorkspace(user, {
            userId,
            workspaceId,
        })
    }
}
