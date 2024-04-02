import { Global, Module } from '@nestjs/common'
import { AccessControlController } from './access-control.controller'
import { PrismaModule } from '@/prisma/prisma.module'
import { RulesService } from './rules/rules.service'
import { RolesService } from '@/access-control/roles/roles.service'
import { UsersRolesService } from './users-roles/users-roles.service'
import { UsersRolesController } from './users-roles/users-roles.controller'
import { PolicyInformationPointService } from '@/access-control/policy-information-point.service'
import { DefaultRolesService } from '@/access-control/roles/default-roles.service'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
// import { APP_INTERCEPTOR } from '@nestjs/core'
import { AccessControlListeners } from '@/access-control/listeners'
import { UsersRulesGetHandler } from '@/access-control/handlers/users-rules-get.handler'
import { RolesController } from '@/access-control/roles/roles.controller'

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [
        AccessControlController,
        UsersRolesController,
        RolesController,
    ],
    providers: [
        RulesService,
        RolesService,
        UsersRolesService,
        UsersRulesGetHandler,
        DefaultRolesService,
        PolicyInformationPointService,
        PolicyEnforcementPointInterceptor,
        ...AccessControlListeners,
    ],
    exports: [
        UsersRolesService,
        DefaultRolesService,
        RolesService,
        RulesService,
        PolicyInformationPointService,
        PolicyEnforcementPointInterceptor,
    ],
})
export class AccessControlModule {}
