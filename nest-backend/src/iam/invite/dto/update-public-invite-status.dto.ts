import { IsBoolean, IsNumber } from 'class-validator'

export class UpdatePublicInviteStatus {
    @IsBoolean()
    enabled: boolean

    @IsNumber()
    workspaceId: number
}
