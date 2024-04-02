import { Task } from '@/task/entities/task.entity'
import { Status } from '@/board/entities/status.entity'
import { Board as PrismaBoard } from '@prisma/client'
import { IsInt, IsString } from 'class-validator'

export class Board implements PrismaBoard {
    @IsInt()
    id: number

    @IsString()
    title: string

    projectId: number

    statuses: Status[]

    tasks: Task[]

    createdAt: Date

    updatedAt: Date
}
