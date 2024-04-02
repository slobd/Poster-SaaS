import { PrismaService } from '@/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { project, Project } from '../project.types'


@Injectable()
export class ProjectGetOneHandler {
    constructor(private readonly prisma: PrismaService) {}

    async handle(id: number): Promise<Project> {
        return this.prisma.project.findUnique({
            where: { id },
            ...project,
        })
    }
}
