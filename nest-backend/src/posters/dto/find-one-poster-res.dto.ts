import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { Poster } from '../entities/poster.entity'
import { OmitType } from '@nestjs/swagger'

export class FindOnePosterResDto extends OmitType(Poster, [
    'user',
    'authors',
] as const) {
    user: SanitizedUserDto

    authors: SanitizedUserDto[]
}
