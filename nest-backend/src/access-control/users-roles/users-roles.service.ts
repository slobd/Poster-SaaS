import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, Role, User } from '@prisma/client'

export type UserWithRoles = Prisma.UserGetPayload<{
    select: {
        firstName: boolean
        lastName: boolean
        roles: { include: { role: boolean } }
        id: boolean
        email: boolean
    }
    data: { roles: { create: { role: { connect: { id: number } } } } }
    where: { id: number }
}>

@Injectable()
export class UsersRolesService {
    constructor(private readonly prisma: PrismaService) {}

    async giveRoleToUser(
        userId: number,
        roleId: number,
    ): Promise<UserWithRoles> {
        try {
            return await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    roles: {
                        create: {
                            role: {
                                connect: {
                                    id: roleId,
                                },
                            },
                        },
                    },
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    roles: {
                        include: {
                            role: true,
                        },
                    },
                },
            })
        } catch (e) {
            if (
                e instanceof Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002'
            ) {
                throw new InternalServerErrorException(
                    `User ${userId} had already role ${roleId}`,
                )
            }
        }
    }

    async getRolesOfUser(userId: number): Promise<Role[]> {
        return this.prisma.role.findMany({
            where: {
                users: {
                    some: {
                        user: {
                            id: userId,
                        },
                    },
                },
            },
        })
    }

    /**
     * Give a new role to a user in a given domain,
     * if the user had a role already in that domain, remove it
     * @param userId
     * @param roleId
     */
    async upsertRoleOfUser(
        userId: number,
        roleId: number,
    ): Promise<UserWithRoles> {
        const role = await this.prisma.role.findUnique({
            where: {
                id: roleId,
            },
        })

        // There should be one role per domain associated with the user
        const userRoles: Role[] = await this.getRolesOfUser(userId)

        const roleOfSameDomain = userRoles.find(
            (userRole) => userRole.domain === role.domain,
        )

        if (roleOfSameDomain) {
            await this.deleteRoleFromUser(userId, roleOfSameDomain.id)
        }

        return this.giveRoleToUser(userId, roleId)
    }

    async deleteRoleFromUser(userId: number, roleId: number): Promise<User> {
        return this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                roles: {
                    deleteMany: {
                        roleId: roleId,
                    },
                },
            },
        })
    }
}
