import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseInterceptors,
} from '@nestjs/common'
import { WorkspacesGetOneHandler } from '@/workspace/handlers/workspaces-get-one.handler'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { WorkspacesPatchHandler } from '@/workspace/handlers/workspaces-patch.handler'
import { UpdateWorkspacesDto } from '@/workspace/dto/update-workspaces.dto'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { WorkspacesGetHandler } from '@/workspace/handlers/workspaces-get.handler'
import { FindWorkspacesDto } from '@/workspace/dto/find-workspaces.dto'
import { Workspace } from '@prisma/client'
import { CreateWorkspaceDto } from '@/workspace/dto/create-workspace.dto'
import { WorkspacesPostHandler } from '@/workspace/handlers/workspaces-post.handler'
import { User } from '@/utils/decorators/user.decorator'
import { WorkspaceWithTenant } from '@/workspace/workspace.repository'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { WorkspacesDeleteHandler } from './handlers/worksapce-delete.handler'

@Controller('workspaces')
@ApiTags('Workspaces')
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class WorkspaceController {
    constructor(
        private readonly workspacesGetOneHandler: WorkspacesGetOneHandler,
        private readonly workspacesPatchHandler: WorkspacesPatchHandler,
        private readonly workspacesPostHandler: WorkspacesPostHandler,
        private readonly workspacesGetHandler: WorkspacesGetHandler,
        private readonly workspaceDeleteHandler: WorkspacesDeleteHandler,
    ) {}

    @Post('')
    @Policy({
        subject: SubjectEnum.Workspace,
        action: ActionEnum.create,
    })
    @ApiOperation({
        operationId: 'create_one_workspace',
    })
    create(
        @Body() body: CreateWorkspaceDto,
        @User() user: SanitizedUserDto,
    ): Promise<WorkspaceWithTenant> {
        return this.workspacesPostHandler.handle(body, user)
    }

    @Get(':id')
    @Policy({
        subject: SubjectEnum.Workspace,
        action: ActionEnum.read,
    })
    @ApiOperation({
        operationId: 'find_one_workspace',
    })
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @User() user: SanitizedUserDto,
    ): Promise<Workspace> {
        return this.workspacesGetOneHandler.handle(id, user)
    }

    @Get('')
    @Policy({
        subject: SubjectEnum.Workspace,
        action: ActionEnum.list,
        evaluateReadForListAction: true,
    })
    @ApiOperation({
        operationId: 'find_many_workspaces',
    })
    findMany(
        @Query() query: FindWorkspacesDto,
        @User() user: SanitizedUserDto,
    ): Promise<Workspace[]> {
        return this.workspacesGetHandler.handle(query, user)
    }

    @Patch(':id')
    @Policy({
        subject: SubjectEnum.Workspace,
        action: ActionEnum.update,
    })
    @ApiOperation({
        operationId: 'update_workspace',
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateWorkspacesDto,
    ): Promise<Workspace> {
        return this.workspacesPatchHandler.handle(id, body)
    }

    @Delete(':id')
    @Policy({
        subject: SubjectEnum.Workspace,
        action: ActionEnum.delete,
    })
    @ApiOperation({
        operationId: 'delete_workspace',
    })
    async delete(@Param('id', ParseIntPipe) id: number): Promise<Workspace> {
        return this.workspaceDeleteHandler.handle(id)
    }
}
