import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { TaskRepository } from '@/task/task.repository'
import { Upload } from '@prisma/client'
import { TaskService } from '@/task/task.service'

@Injectable()
export class TaskDeleteHandler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly taskRepository: TaskRepository,
        private readonly taskService: TaskService,
    ) {}

    async handle(taskId: number): Promise<void> {
        const task = await this.taskRepository.findOne({
            id: taskId,
        })

        await this.prisma.task.delete({
            where: { id: task.id },
        })

        // TODO: Delete file
        await this.handleAttachmentDeletion(task.attachments)
    }

    private async handleAttachmentDeletion(files: Upload[]) {
        for (const file of files) {
            await this.taskService.deleteAttachment(file)
        }
    }
}
