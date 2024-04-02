import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, Task as PrismaTask } from '@prisma/client'
import {
    Task as TaskWithInclude,
    task as taskWithInclude,
} from '@/task/task.types'
import { Decimal } from '@prisma/client/runtime'

export interface TaskRepositoryCreateArg {
    title: string
    description: string
    positionByStatus: Decimal | number | string
    statusId: number
    boardId: number
}

@Injectable()
export class TaskRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(
        where: Prisma.TaskWhereUniqueInput,
    ): Promise<TaskWithInclude> {
        return this.prisma.task.findUnique({
            where,
            ...taskWithInclude,
        })
    }

    async findLastTask(
        where: Prisma.TaskWhereInput,
    ): Promise<PrismaTask | null> {
        const tasks = await this.prisma.task.findMany({
            where,
            take: 1,
            orderBy: {
                positionByStatus: 'desc',
            },
        })

        if (tasks.length > 0) {
            return tasks[0]
        } else {
            return null
        }
    }

    async findMany(where: Prisma.TaskWhereInput): Promise<TaskWithInclude[]> {
        return this.prisma.task.findMany({
            where,
            ...taskWithInclude,
        })
    }

    async create(body: TaskRepositoryCreateArg): Promise<TaskWithInclude> {
        return this.prisma.task.create({
            data: {
                title: body.title,
                status: {
                    connect: {
                        id: body.statusId,
                    },
                },
                description: body.description,
                board: {
                    connect: {
                        id: body.boardId,
                    },
                },
                positionByStatus: body.positionByStatus,
            },
            include: taskWithInclude.include,
        })
    }

    async update(
        where: Prisma.TaskWhereUniqueInput,
        data: Prisma.TaskUpdateInput,
    ): Promise<TaskWithInclude> {
        return this.prisma.task.update({
            where,
            data,
            ...taskWithInclude,
        })
    }

    async delete(where: Prisma.TaskWhereUniqueInput): Promise<PrismaTask> {
        return this.prisma.task.delete({
            where,
        })
    }
}
