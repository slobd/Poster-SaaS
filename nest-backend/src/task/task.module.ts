import { Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { TaskPostHandler } from '@/task/handlers/task-post.handler'
import { TaskGetOneHandler } from '@/task/handlers/task-get-one.handler'
import { TaskDeleteHandler } from '@/task/handlers/task-delete.handler'
import { TaskAttachmentPatchHandler } from '@/task/handlers/task-attachment-patch.handler'
import { TaskAttachmentDeleteHandler } from '@/task/handlers/task-attachment-delete.handler'
import { TaskRepository } from '@/task/task.repository'
import { UploadsModule } from '@/uploads/uploads.module'
import { TaskPatchHandler } from '@/task/handlers/task-patch.handler'
import { WorkspaceModule } from '@/workspace/workspace.module'
import { StatusRepository } from '@/task/status.repository'

@Module({
    imports: [UploadsModule, WorkspaceModule],
    controllers: [TaskController],
    providers: [
        TaskService,
        TaskPostHandler,
        TaskGetOneHandler,
        TaskPatchHandler,
        TaskDeleteHandler,
        TaskAttachmentPatchHandler,
        TaskAttachmentDeleteHandler,
        TaskRepository,
        StatusRepository,
    ],
    exports: [TaskService],
})
export class TaskModule {}
