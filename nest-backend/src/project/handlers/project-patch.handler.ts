import { PrismaService } from '@/prisma/prisma.service'
import { UploadRepository } from '@/uploads/upload.repository'
import { Injectable } from '@nestjs/common'
import { UpdateProjectDto } from '../dto/update-project.dto'
import { project, Project } from '../project.types'

@Injectable()
export class ProjectPatchHandler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly uploadRepository: UploadRepository,
    ) {}

    async handle(id: number, body: UpdateProjectDto): Promise<Project> {
        const { name, visibility, informationTab } = body
        const { keywords, topics, attachments } = informationTab
        const oldInformationTab = await this.prisma.informationTab.findUnique({
            where: { id: informationTab.id },
            select: {
                id: true,
                description: true,
                topics: true,
                keywords: true,
                attachments: true,
            },
        })
        const currentproject = await this.prisma.project.findUnique({
            where: { id },
            select: {
                workspaceId: true,
            },
        })

        if (topics && oldInformationTab) {
            await this.prisma.informationTab.update({
                where: {
                    id: id,
                },
                data: {
                    topics: {
                        disconnect: oldInformationTab.topics.map((item) => ({
                            id: item.id,
                        })),
                    },
                },
            })
        }

        if (keywords && oldInformationTab) {
            await this.prisma.informationTab.update({
                where: {
                    id: id,
                },
                data: {
                    keywords: {
                        disconnect: oldInformationTab.keywords.map((item) => ({
                            id: item.id,
                        })),
                    },
                },
            })
        }

        for (const oldListItem of oldInformationTab.attachments) {
            let _flag = false
            attachments.forEach((newListItem) => {
                if (oldListItem.id == newListItem.id) _flag = true
            })
            if (!_flag) {
                await this.uploadRepository.delete(oldListItem.id)
                _flag = false
            }
        }

        await this.prisma.informationTab.update({
            where: { id: informationTab.id },
            data: {
                description: informationTab.description,
                keywords: informationTab.keywords
                    ? {
                          connectOrCreate: informationTab.keywords.map(
                              (item) => ({
                                  where: {
                                      name_workspaceId: {
                                          name: item.name,
                                          workspaceId:
                                              currentproject.workspaceId,
                                      },
                                  },
                                  create: {
                                      name: item.name,
                                      workspace: {
                                          connect: {
                                              id: currentproject.workspaceId,
                                          },
                                      },
                                  },
                              }),
                          ),
                      }
                    : undefined,
                topics: informationTab.topics
                    ? {
                          connectOrCreate: informationTab.topics.map(
                              (item) => ({
                                  where: {
                                      name_workspaceId: {
                                          name: item.name,
                                          workspaceId:
                                              currentproject.workspaceId,
                                      },
                                  },
                                  create: {
                                      name: item.name,
                                      workspace: {
                                          connect: {
                                              id: currentproject.workspaceId,
                                          },
                                      },
                                  },
                              }),
                          ),
                      }
                    : undefined,
            },
        })
        if (attachments) {
            attachments.map(async (item) => {
                await this.prisma.upload.update({
                    where: {
                        id: item.id,
                    },
                    data: {
                        informationTabId: informationTab.id,
                    },
                })
            })
        }

        return await this.prisma.project.update({
            where: { id },
            data: {
                name: name,
                visibility: visibility,
            },
            ...project,
        })
    }
}
