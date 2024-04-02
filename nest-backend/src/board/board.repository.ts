import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { board, Board, CreateTasksInBoard } from '@/board/board.types'

@Injectable()
export class BoardRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findOne(where: Prisma.BoardWhereUniqueInput): Promise<Board> {
        return this.prisma.board.findUnique({
            where,
            ...board,
        })
    }

    async findMany(where: Prisma.BoardWhereInput): Promise<Board[]> {
        return this.prisma.board.findMany({
            where,
            ...board,
        })
    }

    async create(data: Prisma.BoardCreateInput): Promise<Board> {
        return this.prisma.board.create({
            data,
            ...board,
        })
    }

    async update(id: number, data: Prisma.BoardUpdateInput): Promise<Board> {
        return this.prisma.board.update({
            where: {
                id,
            },
            data,
            ...board,
        })
    }

    async delete(id: number): Promise<Board> {
        return this.prisma.board.delete({
            where: { id },
            ...board,
        })
    }

    async updateBoardTasks(id: number, tasks: CreateTasksInBoard[]): Promise<Board> {
        return this.prisma.board.update({
            where: { id },
            data: {
                tasks: {
                    createMany: {
                        data: tasks,
                    }
                }
            },
            ...board
        })
    }
}
