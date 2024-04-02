import { PrismaService } from '@/prisma/prisma.service'
import { Poster, PosterVisibilityEnum, Prisma, Upload } from '@prisma/client'
import { Injectable, InternalServerErrorException } from '@nestjs/common'

import { KeywordDto } from '@/posters/dto/keyword.dto'
import { TopicDto } from '@/posters/dto/topic.dto'
import { keywordOrTopicToCreateOrConnect } from '@/utils/helpers'
import { PartialType } from '@nestjs/swagger'

export const posterDto = Prisma.validator<Prisma.PosterArgs>()({
    select: {
        id: true,
        title: true,
        description: true,
        keywords: true,
        topics: true,
        visibility: true,
        pdf: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        workspace: {
            select: {
                id: true,
                tenantId: true,
            },
        },
        user: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                organizationName: true,
                email: true,
            },
        },
        authors: {
            select: {
                id: true,
                firstName: true,
                lastName: true,
                organizationName: true,
                email: true,
            },
        },
    },
})

export type PosterDto = Prisma.PosterGetPayload<typeof posterDto>

export class CreatePoster {
    title: string

    workspace: { id: number }

    description?: string

    keywords?: KeywordDto[]

    topics?: TopicDto[]

    visibility: PosterVisibilityEnum

    authors: { id: number }[]

    pdf?: Upload

    image?: Upload

    user: { id: number }
}

export class UpdatePoster extends PartialType(CreatePoster) {
    id: number
}

@Injectable()
export class PosterRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(arg: CreatePoster): Promise<PosterDto> {
        const data = this.getPosterCreateInput(arg)
        return this.prisma.poster.create({
            data,
            ...posterDto,
        })
    }

    private getPosterCreateInput(data: CreatePoster): Prisma.PosterCreateInput {
        const { image, pdf, user } = data

        return {
            ...data,
            title: data.title,
            description: data.description,
            workspace: {
                connect: {
                    id: data.workspace.id,
                },
            },
            user: {
                connect: {
                    id: user.id,
                },
            },
            authors: {
                connect: data.authors,
            },
            image: image ? { connect: { id: image.id } } : undefined,
            pdf: pdf ? { connect: { id: pdf.id } } : undefined,
            keywords: data.keywords
                ? {
                      connectOrCreate: keywordOrTopicToCreateOrConnect(
                          data.keywords,
                          data.workspace.id,
                      ),
                  }
                : undefined,
            topics: data.topics
                ? {
                      connectOrCreate: keywordOrTopicToCreateOrConnect(
                          data.topics,
                          data.workspace.id,
                      ),
                  }
                : undefined,
        }
    }

    async findOneById(id: number): Promise<PosterDto> {
        return this.prisma.poster.findUnique({
            where: { id },
            ...posterDto,
        })
    }

    async findMany(
        where: Prisma.PosterWhereInput,
        skip?: number,
        take?: number,
    ): Promise<PosterDto[]> {
        return this.prisma.poster.findMany({
            where,
            skip,
            take,
            ...posterDto,
        })
    }

    async update(arg: UpdatePoster): Promise<PosterDto> {
        try {
            if (arg.topics) {
                await this.prisma.topic.createMany({
                    data: arg.topics.map((t) => ({
                        name: t.name,
                        workspaceId: arg.workspace.id,
                    })),
                    skipDuplicates: true,
                })
            }

            if (arg.keywords) {
                await this.prisma.keyword.createMany({
                    data: arg.keywords.map((k) => ({
                        name: k.name,
                        workspaceId: arg.workspace.id,
                    })),
                    skipDuplicates: true,
                })
            }

            const data = this.getPosterUpdateInput(arg)

            return this.prisma.poster.update({
                where: {
                    id: arg.id,
                },
                data: data,
                ...posterDto,
            })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    private getPosterUpdateInput(data: UpdatePoster) {
        return {
            title: data.title,
            description: data.description,
            visibility: data.visibility,
            keywords: data.keywords
                ? {
                      set: data.keywords.map((k) => ({
                          name_workspaceId: {
                              name: k.name,
                              workspaceId: data.workspace.id,
                          },
                      })),
                  }
                : undefined,
            // keywords: data.keywords
            //     ? {
            //           connectOrCreate: keywordOrTopicToCreateOrConnect(
            //               data.keywords,
            //               data.workspace.id,
            //           ),
            //       }
            //     : undefined,
            topics: data.topics
                ? {
                      set: data.topics.map((t) => ({
                          name_workspaceId: {
                              name: t.name,
                              workspaceId: data.workspace.id,
                          },
                      })),
                  }
                : undefined,
            authors: {
                set: data.authors,
            },
        }
    }

    async delete(id: number): Promise<Poster> {
        try {
            return this.prisma.poster.delete({
                where: { id },
            })
        } catch (e) {
            throw new InternalServerErrorException(
                'The document could not be deleted',
            )
        }
    }
}
