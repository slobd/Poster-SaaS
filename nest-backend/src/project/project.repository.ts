import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, ProjectVisibilityEnum } from '@prisma/client'
import { project, Project } from '@/project/project.types'

const projectWithTabs = Prisma.validator<Prisma.ProjectArgs>()({
    include: {
        informationTabs: true,
        boards: true,
    },
})

export type ProjectWithTabs = Prisma.ProjectGetPayload<typeof projectWithTabs>

export type ProjectCreateArgs = {
    name: string
    workspaceId: number
    ownerId: number
}

@Injectable()
export class ProjectRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: ProjectCreateArgs): Promise<Project> {
        return this.prisma.project.create({
            data: {
                name: data.name,
                visibility: ProjectVisibilityEnum.PUBLIC,
                deleted: false,
                informationTabs: {
                    create: {
                        description: '',
                    },
                },
                boards: {
                    create: {
                        statuses: {
                            createMany: {
                                data: [
                                    { name: 'to do' },
                                    { name: 'in progress' },
                                    { name: 'review' },
                                    { name: 'done' },
                                ],
                            },
                        },
                    },
                },
                workspace: {
                    connect: {
                        id: data.workspaceId,
                    },
                },
                owner: data.ownerId
                    ? {
                          connect: {
                              id: data.ownerId,
                          },
                      }
                    : undefined,
            },
            ...project,
        })
    }

    async delete(id: number): Promise<Project> {
        try {
            return this.prisma.project.update({
                where: { id },
                data: {
                    deleted: true,
                },
                ...project,
            })
        } catch (e) {
            throw new InternalServerErrorException(
                'The document could not be deleted',
            )
        }
    }
}
