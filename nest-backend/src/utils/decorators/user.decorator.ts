import {
    createParamDecorator,
    ExecutionContext,
    InternalServerErrorException,
} from '@nestjs/common'

export const User = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        if (ctx.getType() === 'http') {
            const request = ctx.switchToHttp().getRequest()
            return request.user
        } else {
            throw new InternalServerErrorException(
                'User decorator is being used in an invalid context: ',
                ctx.getType(),
            )
        }
    },
)
