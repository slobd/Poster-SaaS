import { Injectable } from '@nestjs/common'
import { CreateTaskDto } from '@/task/dto/create-task.dto'
import { Task } from '@/task/task.types'
import { POSITION_SCALE } from '@/task/task.constants'
import { INVALID_STATUS_ERROR, STATUS_NOT_FOUND } from '@/task/task.errors'
import { TaskRepository } from '@/task/task.repository'
import { StatusRepository } from '@/task/status.repository'

@Injectable()
export class TaskPostHandler {
    constructor(
        private readonly taskRepository: TaskRepository,
        private readonly statusRepository: StatusRepository,
    ) {}

    async handle(body: CreateTaskDto): Promise<Task> {
        const status = await this.statusRepository.findUnique({
            id: body.statusId,
        })

        if (!status) throw STATUS_NOT_FOUND
        if (status.boardId !== body.board.id) throw INVALID_STATUS_ERROR

        const lastTask = await this.taskRepository.findLastTask({
            status: {
                id: status.id,
            },
        })

        // If the task is the first on in the status we create it with position 0
        const positionByStatus = lastTask
            ? lastTask.positionByStatus.plus(POSITION_SCALE)
            : 0

        return this.taskRepository.create({
            title: body.title,
            description: body.description,
            positionByStatus: positionByStatus,
            statusId: body.statusId,
            boardId: status.boardId,
        })
    }
}
