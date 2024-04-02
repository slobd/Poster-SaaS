import { BadRequestException, Injectable } from '@nestjs/common'
import { TaskRepository } from '@/task/task.repository'
import { Task } from '@/task/entities/task.entity'

@Injectable()
export class TaskGetOneHandler {
    constructor(private readonly taskRepository: TaskRepository) {}

    async handle(id: number): Promise<Task> {
        const task = await this.taskRepository.findOne({
            id: id,
        })

        if (!task) throw new BadRequestException('Task ID does not exist')

        return task
    }
}
