import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { SubjectEnum } from '@/access-control/access-control.types'
import { Prisma } from '@prisma/client'
import { BaseClass } from '@/utils/shared/base-class'

const ResourceEntityMap = {
    [SubjectEnum.Poster]: 'poster' as const,
    [SubjectEnum.User]: 'user' as const,
    [SubjectEnum.Workspace]: 'workspace' as const,
    [SubjectEnum.Project]: 'project' as const,
    [SubjectEnum.Comment]: 'comment' as const,
    [SubjectEnum.Invite]: 'invite' as const,
    [SubjectEnum.Board]: 'board' as const,
    [SubjectEnum.Task]: 'task' as const,
    [SubjectEnum.Tenant]: 'tenant' as const,
}

const SelectOrIncludeArgs = {
    [SubjectEnum.Project]: {
        select: {
            id: true,
            visibility: true,
            workspace: {
                select: {
                    id: true,
                    tenantId: true,
                },
            },
        },
    } as Prisma.ProjectArgs,
    [SubjectEnum.User]: {
        select: {
            id: true,
            roles: {
                include: {
                    role: {
                        select: {
                            domain: true,
                        },
                    },
                },
            },
        },
    } as Prisma.UserArgs,
    [SubjectEnum.Poster]: {
        select: {
            id: true,
            visibility: true,
            workspace: {
                select: {
                    id: true,
                    tenantId: true,
                },
            },
        },
    } as Prisma.PosterArgs,
    [SubjectEnum.Comment]: {
        select: {
            id: true,
            user: {
                select: {
                    id: true,
                },
            },
            posterId: true,
            poster: {
                select: {
                    id: true,
                    workspace: {
                        select: {
                            id: true,
                            tenantId: true,
                        },
                    },
                },
            },
        },
    } as Prisma.CommentArgs,
    [SubjectEnum.Invite]: {
        select: {
            id: true,
            workspace: {
                select: {
                    id: true,
                    tenantId: true,
                },
            },
        },
    } as Prisma.InviteArgs,
    [SubjectEnum.Board]: {
        select: {
            id: true,
            project: {
                select: {
                    visibility: true,
                    workspaceId: true,
                },
            },
        },
    } as Prisma.BoardArgs,
    [SubjectEnum.Task]: {
        select: {
            id: true,
            board: {
                select: {
                    project: {
                        select: {
                            visibility: true,
                            workspace: {
                                select: {
                                    id: true,
                                    tenantId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    } as Prisma.TaskArgs,
}

@Injectable()
export class PolicyInformationPointService extends BaseClass {
    constructor(private readonly prisma: PrismaService) {
        super()
    }

    async findUniqueResource(
        uniqueId: number,
        resource: SubjectEnum,
    ): Promise<any> {
        if (!(resource in SubjectEnum))
            throw new ForbiddenException('Invalid resource')

        this.logger.debug({
            resource,
            uniqueId,
        })

        let findUniqueArgs = {
            where: {
                id: uniqueId,
            },
        }

        /**
         * Include or select fields that may be needed for the authorization rules.
         * For example most entity will need to include either the workspace or the tenant
         */
        const select = SelectOrIncludeArgs[resource]

        /**
         * Decides which Prisma model to use for the findUnique query
         */
        const model = ResourceEntityMap[resource]

        if (select)
            findUniqueArgs = {
                ...findUniqueArgs,
                ...select,
            }

        const entity = await this.prisma[model].findUnique(findUniqueArgs)

        if (!entity) {
            throw new NotFoundException(
                `Entity ${resource} with id ${uniqueId} was not found`,
            )
        }

        return entity
    }
}
