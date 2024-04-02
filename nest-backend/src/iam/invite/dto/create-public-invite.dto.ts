import { IsNumber } from 'class-validator'

export class CreatePublicInviteDto {
    @IsNumber()
    workspaceId: number
}
