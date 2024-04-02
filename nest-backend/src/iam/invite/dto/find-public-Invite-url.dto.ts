import { IsInt } from 'class-validator'
import { Type } from 'class-transformer'

export class FindPublicInviteUrlDto {
    @IsInt()
    @Type(() => Number)
    workspaceId: number
}
