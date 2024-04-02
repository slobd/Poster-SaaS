import { BadRequestException, Injectable } from '@nestjs/common'
import { TaskRepository } from '@/task/task.repository'
import { TaskService } from '@/task/task.service'

@Injectable()
export class TaskAttachmentDeleteHandler {
    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly taskService: TaskService,
    ) {}

    async handle(taskId: number, uploadId: number): Promise<void> {
        const task = await this.taskRepository.findOne({
            id: taskId,
        })

        const index = task.attachments.findIndex((a) => a.id === uploadId)

        if (index === -1)
            throw new BadRequestException(
                'This attachment does not belong to this file',
            )

        await this.taskService.deleteAttachment(task.attachments[index])
    }
}
