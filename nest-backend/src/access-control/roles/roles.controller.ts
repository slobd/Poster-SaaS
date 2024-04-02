import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import {
    CreateRoleDto,
    RoleWithRules,
    UpdateRoleDto,
} from '@/access-control/entities/role.entity'
import { CurrentTenant } from '@/utils/decorators/tenant.decorator'
import { Tenant } from '@/tenant/entities/tenant.entity'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { RolesService } from '@/access-control/roles/roles.service'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { ApiTags } from '@nestjs/swagger'

@Controller('access-control/roles')
@ApiTags('Access Control - Roles')
@UseGuards(JwtAuthGuard)
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post('')
    @UseGuards(IsDevGuard)
    createRole(
        @Body() body: CreateRoleDto,
        @CurrentTenant() tenant: Tenant,
    ): Promise<RoleWithRules> {
        return this.rolesService.createRole(body, tenant)
    }

    @Patch('')
    @UseGuards(IsDevGuard)
    async updateRole(@Body() body: UpdateRoleDto): Promise<RoleWithRules> {
        return this.rolesService.updateRole(body)
    }

    @Get('')
    @Policy({
        subject: SubjectEnum.Role,
        action: ActionEnum.list,
    })
    getRoles(@Query('domain') domain: string): Promise<RoleWithRules[]> {
        return this.rolesService.findManyRoles({ domain })
    }
}
