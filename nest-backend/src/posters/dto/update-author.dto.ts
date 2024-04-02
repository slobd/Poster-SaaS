import { PartialType } from '@nestjs/swagger'
import { User } from '@/iam/users/entities/user.entity'

export class UpdateAuthorDto extends PartialType(User) {}
