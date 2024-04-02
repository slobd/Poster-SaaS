import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Enforcer } from 'casbin'
import { Actions, CASBIN_ENFORCER, GUEST, Resources } from '@/iam/iam.constants'
import { Request } from 'express'

@Injectable()
export class PolicyTestGuard implements CanActivate {
    constructor(
        @Inject(CASBIN_ENFORCER) private readonly enforcer: Enforcer,
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        // Get the policy from the @Policy decorator
        // console.log('POLICY TEST GUARD')

        const policy: (id?: string) => [Resources, Actions] =
            this.reflector.get('policy', context.getHandler())

        // console.log(policy)
        // No policy means that the API endpoint can be accessed by anyone
        if (!policy) {
            return true
        }
        const request: Request = context.switchToHttp().getRequest()

        const tenant = request.tenant
        // console.log('TENANT', tenant)

        const guestRole = `role::${GUEST}`
        // If there is no user in the request set the sub to guess
        const sub = request.user?.id || guestRole

        // this.logger.log(request.user)

        const id = request.params.id

        const permissions = id ? policy(id) : policy()

        const definedPolicy = [sub, tenant.id, ...permissions]

        // console.log('definedPolicy', definedPolicy)

        return this.enforcer.enforce(...definedPolicy)
    }
}
