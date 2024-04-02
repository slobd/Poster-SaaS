import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { CurrentTenant } from '@/utils/decorators/tenant.decorator'
import { Tenant as TenantEntity } from '@/tenant/entities/tenant.entity'
import { UserWithRolesAndAvatar } from '@/iam/users/user.repository'
import { PrismaService } from '@/prisma/prisma.service'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import { ApiTags } from '@nestjs/swagger'

@Controller('iam/users')
@ApiTags('IAM - Users [Deprecated]')
@UseGuards(IsDevGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly prisma: PrismaService,
    ) {}

    /**
     * @deprecated
     */
    @Get('')
    @UseGuards(JwtAuthGuard)
    // @Policy(permissions.USER.READ_ALL)
    async getAllUsersFromTenant(
        @CurrentTenant() tenant: TenantEntity,
    ): Promise<UserWithRolesAndAvatar[]> {
        return this.usersService.findManyByTenantId(tenant.id)
    }

    /**
     * @deprecated
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    // @Policy(permissions.USER.READ_ALL)
    async getOneUserFromTenant(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<UserWithRolesAndAvatar> {
        // TODO: Only return roles of the tenant that requested this
        return this.prisma.user.findUnique({
            where: {
                id: id,
            },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                tenant: true,
                            },
                        },
                    },
                },
                avatar: true,
            },
        })
    }
}
