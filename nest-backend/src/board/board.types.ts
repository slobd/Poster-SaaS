import { Prisma, Task } from '@prisma/client'
import { task } from '@/task/task.types'

export const board = Prisma.validator<Prisma.BoardArgs>()({
    include: {
        tasks: task,
        statuses: true,
        project: {
            include: {
                workspace: true,
            },
        },
    },
})

export type Board = Prisma.BoardGetPayload<typeof board>
export type CreateTasksInBoard = Omit<Task, 'id'| 'dueDate' | 'createdAt'| 'updatedAt' | 'boardId'>