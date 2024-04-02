import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotImplementedException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { Policy } from '@/access-control/policy.decorator'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { Task } from '@/task/entities/task.entity'
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { BaseClass } from '@/utils/shared/base-class'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import { MulterS3FileRecord } from '@/uploads/types/MulterS3File'
import { TaskDeleteHandler } from '@/task/handlers/task-delete.handler'
import { TaskPostHandler } from '@/task/handlers/task-post.handler'
import { TaskAttachmentPatchHandler } from '@/task/handlers/task-attachment-patch.handler'
import { TaskAttachmentDeleteHandler } from '@/task/handlers/task-attachment-delete.handler'
import { TaskPatchHandler } from '@/task/handlers/task-patch.handler'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { User } from '@/utils/decorators/user.decorator'

/**
 * https://www.mscharhag.com/api-design/rest-partial-updates-patch
 */

@Controller('tasks')
@ApiTags('Tasks')
export class TaskController extends BaseClass {
    constructor(
        private readonly taskPatchHandler: TaskPatchHandler,
        private readonly taskDeleteHandler: TaskDeleteHandler,
        private readonly taskPostHandler: TaskPostHandler,
        private readonly taskAttachmentPatchHandler: TaskAttachmentPatchHandler,
        private readonly taskAttachmentDeleteHandler: TaskAttachmentDeleteHandler,
    ) {
        super()
    }

    /**
     * TODO: Fix vulnerability issue with create action on POST routes
     * Currently we validate the casl rules against the body of the request.
     * There are some cases where we want to validate also the entity from the database
     * for example.
     * - Let's say the user creates a task in a public project
     *   currently, the user send a "project" entity with the request and this "project" have
     *   the properties "workspaceId" and "visibility": PUBLIC.
     *   The problem is that we DO NOT validate if this project actually have the visibility PUBLIC
     *   we only trust the frontend to send the right project
     */
    @Post('')
    @ApiOperation({
        operationId: 'create_task',
    })
    @Policy({
        subject: SubjectEnum.Task,
        action: ActionEnum.create,
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
        return this.taskPostHandler.handle(createTaskDto)
    }

    @UseGuards(IsDevGuard)
    @Get(':id')
    @ApiOperation({
        operationId: 'find_one_task',
    })
    @Policy({
        subject: SubjectEnum.Task,
        action: ActionEnum.read,
    })
    async findOne(@Param('id') _id: string): Promise<Task> {
        throw new NotImplementedException()
    }

    /**
     * Project role:
     * Task.Board.projectId = $projectId
     * Workspace role:
     * Task.Board.Project.visibility  PUBLIC
     * Task.Board.Project.workspaceId = $workspaceId
     */
    @Patch(':id')
    @ApiOperation({
        operationId: 'update_task',
    })
    @Policy({
        subject: SubjectEnum.Task,
        action: ActionEnum.update,
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskDto: UpdateTaskDto,
        @User() authenticatedUser: SanitizedUserDto,
    ): Promise<void> {
        return this.taskPatchHandler.handle(id, updateTaskDto, authenticatedUser)
    }

    @Patch(':id/uploads')
    @ApiOperation({
        operationId: 'create_task_upload',
    })
    @HttpCode(HttpStatus.CREATED)
    @Policy({
        subject: SubjectEnum.Task,
        action: ActionEnum.update,
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'attachment', maxCount: 1 }]),
        PolicyEnforcementPointInterceptor,
    )
    addFileToTask(
        @Param('id') _id: number,
        @UploadedFiles() files: MulterS3FileRecord,
    ): Promise<Task> {
        const file = files['attachment'][0]

        if (!file) return

        return this.taskAttachmentPatchHandler.handle(_id, [file])
    }

    @Delete(':taskId/uploads/:uploadId')
    @ApiOperation({
        operationId: 'delete_task_upload',
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Policy({
        subject: SubjectEnum.Task,
        action: ActionEnum.update,
        informationProvider: {
            identifier: 'taskId',
        },
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    removeFileToTask(
        @Param('taskId') _taskId: number,
        @Param('uploadId') _uploadId: number,
    ): Promise<void> {
        return this.taskAttachmentDeleteHandler.handle(_taskId, _uploadId)
    }

    /**
     * Project role:
     * Task.Board.projectId = $projectId
     * Workspace role:
     * Task.Board.Project.visibility  PUBLIC
     * Task.Board.Project.workspaceId = $workspaceId
     */
    @Delete(':id')
    @ApiOperation({
        operationId: 'delete_task',
    })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Policy({
        subject: SubjectEnum.Task,
        action: ActionEnum.delete,
    })
    @UseInterceptors(PolicyEnforcementPointInterceptor)
    remove(@Param('id') id: number): Promise<void> {
        return this.taskDeleteHandler.handle(id)
    }
}
