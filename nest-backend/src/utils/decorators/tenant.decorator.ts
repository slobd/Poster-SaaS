import {
    createParamDecorator,
    ExecutionContext,
    InternalServerErrorException,
} from '@nestjs/common'

export const CurrentTenant = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        if (ctx.getType() === 'http') {
            const request = ctx.switchToHttp().getRequest()
            return request.tenant
        } else {
            throw new InternalServerErrorException(
                'Tenant decorator is being used in an invalid context: ',
                ctx.getType(),
            )
        }
    },
)
