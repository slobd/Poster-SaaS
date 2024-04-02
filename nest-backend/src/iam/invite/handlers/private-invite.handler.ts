import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreateInviteDto } from '@/iam/invite/dto/create-invite.dto'
import { ConfigService } from '@nestjs/config'
import { MailService } from '@/mail/mail.service'
import { EmailInvitationMail } from '@/mail/mailables/invitation.mail'
import { Workspace } from '@prisma/client'
import { InviteRepository } from '@/iam/invite/invite.repository'
import { InviteService } from '@/iam/invite/invite.service'
import { RoleDomain } from '@/access-control/rules/rules.constants'

@Injectable()
export class PrivateInviteHandler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly mailService: MailService,
        private readonly inviteRepository: InviteRepository,
        private readonly inviteService: InviteService,
    ) {}

    async handle(body: CreateInviteDto): Promise<string> {
        const token = this.inviteService.generateInviteToken()
        const role = await this.prisma.role.findUnique({
            where: {
                id: body.roleId,
            },
        })

        if (role.domain !== RoleDomain.Workspace(body.workspaceId))
            throw new ForbiddenException('Can not invite users with this role')

        if (role && role.name === 'Owner')
            throw new BadRequestException('Can not invite user with owner role')

        const existingInvite = await this.inviteRepository.findMany({
            email: body.email,
            workspaceId: body.workspaceId,
            enabled: true,
        })

        if (existingInvite.length > 0) {
            await this.inviteRepository.delete({
                id: existingInvite[0].id,
            })
        }

        await this.inviteRepository.create({
            token: token,
            email: body.email,
            role: {
                connect: {
                    id: body.roleId,
                },
            },
            workspace: {
                connect: {
                    id: body.workspaceId,
                },
            },
        })

        const inviteUrl = this.generateInviteUrl(body.email, token)

        const workspace = await this.prisma.workspace.findUnique({
            where: {
                id: body.workspaceId,
            },
        })

        await this.sendUserInviteByEmail(inviteUrl, body.email, workspace)

        return inviteUrl
    }

    private generateInviteUrl(email, token): string {
        const host = this.configService.get<string>('BACKEND_URL')
        return `${host}/iam/invite/accept-invite?email=${email}&token=${token}`
    }

    private async sendUserInviteByEmail(
        url: string,
        email: string,
        workspace: Workspace,
    ) {
        const mail = new EmailInvitationMail({
            inviteEmailUrl: url,
            organization: workspace.name,
        })
        await this.mailService.sendMail(mail, email, workspace.id)
    }
}
