import { PosterVisibilityEnum, Prisma, User } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

export const workspaceUserFindManyWithFilter = (
    filterPrivatePosters: boolean,
): typeof workspaceUserFindMany => {
    const visibility = filterPrivatePosters ? PosterVisibilityEnum.PUBLIC : null
    const filters: any = { ...workspaceUserFindMany }
    if (visibility !== null){
        filters.select.posters.where = { visibility }
        filters.select.authoredPosters.where = { visibility }
    }
    return filters
}

export const workspaceUserFindMany = Prisma.validator<Prisma.UserArgs>()({
    select: {
        id: true,
        firstName: true,
        lastName: true,
        organizationName: true,
        biography: true,
        currentPosition: true,
        linkedin: true,
        researchGate: true,
        twitter: true,
        skills: true,
        avatar: true,
        workspaces: true,
        userAccount: true,
        roles: true,
        posters: {
            select: {
                id: true,
                user: true,
                image: true,
                title: true,
                visibility: true,
                topics: true,
                keywords: true,
            },
        },
        authoredPosters: {
            select: {
                id: true,
                user: true,
                image: true,
                title: true,
                visibility: true,
                topics: true,
                keywords: true,
            },
        },
    },
})

export type WorkspaceUserFindMany = Prisma.UserGetPayload<
    typeof workspaceUserFindMany
>

export const userWithAvatar = Prisma.validator<Prisma.UserArgs>()({
    include: {
        avatar: true,
    },
})

export type UserWithAvatar = Prisma.UserGetPayload<typeof userWithAvatar>

export const userWithRolesAndAvatar = Prisma.validator<Prisma.UserArgs>()({
    include: {
        roles: {
            include: {
                role: {
                    include: {
                        tenant: true,
                    },
                },
            },
        },
        avatar: true,
    },
})

export type UserWithRolesAndAvatar = Prisma.UserGetPayload<
    typeof userWithRolesAndAvatar
>

export const userWithRolesAndAvatarAndPosters =
    Prisma.validator<Prisma.UserArgs>()({
        include: {
            roles: {
                include: {
                    role: {
                        include: {
                            tenant: true,
                        },
                    },
                },
            },
            avatar: true,
            posters: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    keywords: true,
                    topics: true,
                    image: true,
                    pdf: true,
                    visibility: true,
                    authors: true,
                    user: true,
                    userId: true,
                },
            },
            userAccount: true,
        },
    })

export type UserWithRolesAndAvatarAndPosters = Prisma.UserGetPayload<
    typeof userWithRolesAndAvatarAndPosters
>

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * @description Load relations 'roles', 'roles.tenant', 'avatar'
     */
    async findUnique(
        where: Prisma.UserWhereUniqueInput,
    ): Promise<UserWithRolesAndAvatarAndPosters> {
        // TODO: Fetch user from Azure AD B2C
        return this.prisma.user.findUnique({
            where: where,
            ...userWithRolesAndAvatarAndPosters,
        })
    }

    async findMany(
        where: Prisma.UserWhereInput,
    ): Promise<WorkspaceUserFindMany[]> {
        return this.prisma.user.findMany({
            where,
            ...workspaceUserFindMany,
        })
    }

    async findManyByTenantId(
        id: number,
    ): Promise<UserWithRolesAndAvatarAndPosters[]> {
        // TODO: This will be use the user directory in the future
        return this.prisma.user.findMany({
            where: {
                roles: {
                    every: {
                        role: {
                            tenantId: id,
                        },
                    },
                },
            },
            ...userWithRolesAndAvatarAndPosters,
        })
    }

    async findManyByWorkspace(
        id: number,
    ): Promise<UserWithRolesAndAvatarAndPosters[]> {
        // TODO: This will be use the user directory in the future
        return this.prisma.user.findMany({
            where: {
                roles: {
                    every: {
                        role: {
                            tenant: {
                                workspaces: {
                                    some: {
                                        id: {
                                            equals: id,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            ...userWithRolesAndAvatarAndPosters,
        })
    }
    async delete(id: number): Promise<User> {
        // // TODO: Delete user from Azure AD B2C
        return this.prisma.user.delete({
            where: {
                id: id,
            },
        })
    }

    async create(user: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({
            data: user,
        })
    }

    async update(
        where: Prisma.UserWhereUniqueInput,
        data: Prisma.UserUpdateInput,
    ): Promise<User> {
        const skills: any = data.skills
        if (skills) {
            await this.prisma.skill.createMany({
                data: skills.map((item) => ({
                    name: item.name,
                })),
                skipDuplicates: true,
            })
        }
        return this.prisma.user.update({
            where,
            data: {
                ...data,
                skills: skills
                    ? {
                          set: skills.map((item) => ({
                              name: item.name,
                          })),
                      }
                    : undefined,
            },
        })
    }
}
