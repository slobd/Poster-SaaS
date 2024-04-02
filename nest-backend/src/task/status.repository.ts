import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, TaskStatus } from '@prisma/client'
@Injectable()
export class StatusRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findUnique(
        where: Prisma.TaskStatusWhereUniqueInput,
    ): Promise<TaskStatus> {
        return this.prisma.taskStatus.findUnique({
            where,
        })
    }
}
