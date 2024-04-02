import { BadRequestException, Injectable } from '@nestjs/common'
import { TaskRepository } from '@/task/task.repository'
import { MulterS3File } from '@/uploads/types/MulterS3File'
import { TaskService } from '@/task/task.service'
import { Task } from '@/task/entities/task.entity'
import { union } from 'lodash'

@Injectable()
export class TaskAttachmentPatchHandler {
    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly taskService: TaskService,
    ) {}

    async handle(id: number, files: MulterS3File[]): Promise<Task> {
        const task = await this.taskRepository.findOne({
            id: id,
        })

        if (!task) throw new BadRequestException('Task ID does not exist')

        const newAttachmentList = await this.handleAttachmentUploads(files)

        const oldAttachmentList = this.fetchOldAttachmentList(task)

        return await this.taskRepository.update(
            {
                id: task.id,
            },
            {
                attachments: {
                    set: [],
                    connect: union(oldAttachmentList, newAttachmentList),
                },
            },
        )
    }

    private async handleAttachmentUploads(files: MulterS3File[]) {
        const attachmentList = []
        for (const file of files) {
            const attachment = await this.taskService.uploadAttachments(file)
            attachmentList.push({ id: attachment.id })
        }
        return attachmentList
    }

    private fetchOldAttachmentList(task: Task) {
        return task.attachments.map((t) => {
            return { id: t.id }
        })
    }
}
