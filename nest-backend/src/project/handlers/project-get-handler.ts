import { PrismaService } from '@/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { FindProjectDto } from '../dto/find-project.dto'
import { project, Project } from '../project.types'

@Injectable()
export class ProjectGetHandler {
    constructor(private readonly prisma: PrismaService) {}

    async handle(
        query: FindProjectDto,
        workspaceId: number,
    ): Promise<Project[]> {
        const { name, visibility } = query

        return this.prisma.project.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
                visibility: visibility,
                workspaceId: workspaceId,
                deleted: false,
            },
            ...project,
            orderBy: {
                updatedAt: 'desc',
            },
        })
    }
}
