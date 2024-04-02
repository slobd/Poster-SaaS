import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Invite } from '@prisma/client'
import { TenantRoleEnum } from '@/access-control/roles/default-roles.service'
import { UpdatePublicInviteStatus } from '@/iam/invite/dto/update-public-invite-status.dto'
import { InviteRepository } from '@/iam/invite/invite.repository'
import { InviteService } from '@/iam/invite/invite.service'
import { CreatePublicInviteDto } from '@/iam/invite/dto/create-public-invite.dto'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'

@Injectable()
export class PublicInviteHandler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly inviteService: InviteService,
        private readonly inviteRepository: InviteRepository,
    ) {}

    async create(data: CreatePublicInviteDto): Promise<void> {
        const role = await this.prisma.role.findMany({
            where: {
                tenant: {
                    workspaces: {
                        some: {
                            id: data.workspaceId,
                        },
                    },
                },
                name: TenantRoleEnum.MEMBER,
                domain: `Workspace/${data.workspaceId}`,
            },
        })

        if (role.length > 0) {
            const token = this.inviteService.generateInviteToken()

            await this.inviteRepository.create({
                token: token,
                email: '*',
                role: {
                    connect: {
                        id: role[0].id,
                    },
                },
                workspace: {
                    connect: {
                        id: data.workspaceId,
                    },
                },
            })
        }
    }

    async getPublicInvite(workspaceId: number): Promise<Invite> {
        const invite = await this.inviteRepository.findMany({
            workspaceId: workspaceId,
            email: '*',
        })

        if (invite.length > 0) {
            return invite[0]
        }
    }

    async updateInviteStatus(
        body: UpdatePublicInviteStatus,
        user: SanitizedUserDto,
    ) {
        const invite = await this.inviteRepository.findMany({
            email: '*',
            workspaceId: body.workspaceId,
        })

        if (invite.length > 0) {
            return this.inviteRepository.update(
                {
                    id: invite[0].id,
                },
                {
                    enabled: body.enabled,
                    updatedBy: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            )
        }
    }
}
