import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import {
    UsersRolesService,
    UserWithRoles,
} from '@/access-control/users-roles/users-roles.service'
import { Role, User as PrismaUser } from '@prisma/client'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import { User } from '@/utils/decorators/user.decorator'
import { ApiTags } from '@nestjs/swagger'

@Controller('access-control')
@ApiTags('Access Control - User Roles')
export class UsersRolesController {
    constructor(private readonly userRolesService: UsersRolesService) {}

    @Post('users/:id/roles')
    @UseGuards(IsDevGuard)
    async giveRoleToUser(
        @Param('id', ParseIntPipe) userId: number,
        @Body() body: { roleId: number },
    ): Promise<UserWithRoles> {
        return this.userRolesService.giveRoleToUser(userId, body.roleId)
    }

    @Get('users/me')
    @UseGuards(IsDevGuard)
    async getRolesOfCurrentUser(@User() user): Promise<Role[]> {
        return await this.userRolesService.getRolesOfUser(user.id)
    }

    @Get('users/:id/roles')
    @UseGuards(IsDevGuard)
    async getRolesOfUser(
        @Param('id', ParseIntPipe) userId: number,
    ): Promise<Role[]> {
        return await this.userRolesService.getRolesOfUser(userId)
    }

    @Patch('users/:id/roles')
    @UseGuards(IsDevGuard)
    async updateRoleOfUser(
        @Param('id', ParseIntPipe) userId: number,
        @Body() body: { roleId },
    ): Promise<UserWithRoles> {
        return this.userRolesService.upsertRoleOfUser(userId, body.roleId)
    }

    @Delete('users/:id/roles')
    @UseGuards(IsDevGuard)
    async deleteRoleFromUser(
        @Param('id', ParseIntPipe) userId: number,
        @Body() body: { roleId: number },
    ): Promise<PrismaUser | number> {
        return this.userRolesService.deleteRoleFromUser(userId, body.roleId)
    }
}
