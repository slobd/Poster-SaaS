import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { AcceptInviteDto } from '@/iam/invite/dto/accept-invite.dto'
import { InviteRepository } from '@/iam/invite/invite.repository'
import { InviteService } from '@/iam/invite/invite.service'
import { Invite } from '@prisma/client'

@Injectable()
export class InviteAcceptHandler {
    constructor(
        private readonly inviteService: InviteService,
        private readonly inviteRepository: InviteRepository,
    ) {}

    async handle(body: AcceptInviteDto): Promise<void> {
        const checkIfInviteExists = await this.inviteRepository.findMany({
            token: body.token,
            enabled: true,
        })

        if (checkIfInviteExists.length === 0) return

        const currentInvite = checkIfInviteExists[0]

        if (currentInvite.email === body.email) {
            await this.handleUserInvite(currentInvite)
        } else if (currentInvite.email === '*') {
            await this.handlePublicWorkspaceInvite(body, currentInvite)
        }

        return
    }

    private async handleUserInvite(currentInvite: Invite) {
        const oneYearBeforeToday = new Date(
            new Date().setDate(new Date().getDate() - 365),
        )

        // created --------- one year before today  ------ today
        if (currentInvite.createdAt < oneYearBeforeToday)
            throw new InternalServerErrorException('The invite has expired')

        await this.inviteRepository.update(
            {
                id: currentInvite.id,
            },
            {
                accepted: true,
            },
        )
    }

    private async handlePublicWorkspaceInvite(
        body: AcceptInviteDto,
        currentInvite: Invite,
    ) {
        // Public invite url accepted
        const token = this.inviteService.generateInviteToken()

        await this.inviteRepository.create({
            token: token,
            email: body.email,
            role: {
                connect: {
                    id: currentInvite.roleId,
                },
            },
            workspace: {
                connect: {
                    id: currentInvite.workspaceId,
                },
            },
            accepted: true,
        })
    }
}
