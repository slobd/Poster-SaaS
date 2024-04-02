import { PickType } from '@nestjs/swagger'
import { User } from '../../iam/users/entities/user.entity'
export class SendMessageUserRequestDto extends PickType(User, [
    'firstName',
    'lastName',
    'email',
    'organizationName'
]) {}
