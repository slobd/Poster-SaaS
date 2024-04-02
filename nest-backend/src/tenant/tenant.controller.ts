import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { TenantCmsPostHandler } from './handlers/tenant-cms-post.handler'
import { CreateTenantAppDto } from './dto/create-tenant-from-web-app.dto'
import { User } from '@/utils/decorators/user.decorator'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { TenantCmsPatchHandler } from './handlers/tenant-cms-patch.handler'
import { FindOneTenantDto } from './dto/find-one-tenant.dto'
import { TenantGetHandler } from './handlers/tenant-get.handler'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import { UpdateTenantFromWebAppDto } from './dto/update-tenant-from-web-app.dto'
import { TenantWithFeatures } from '@/tenant/tenant.repository'
import { Tenant } from '@prisma/client'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import { TenantPatchHandler } from '@/tenant/handlers/tenant-patch.handler'
import { TenantPostHandler } from '@/tenant/handlers/tenant-post.handler'
import { TenantGetByOriginHandler } from '@/tenant/handlers/tenant-get-by-origin.handler'
import { PrismaService } from '@/prisma/prisma.service'
import { Policy } from '@/access-control/policy.decorator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'
import { ApiTags } from '@nestjs/swagger'

@Controller('tenants')
@ApiTags('Tenants')
export class TenantController {
    constructor(
        private readonly tenantCmsPostHandler: TenantCmsPostHandler,
        private readonly tenantCmsPatchHandler: TenantCmsPatchHandler,
        private readonly tenantGetHandler: TenantGetHandler,
        private readonly tenantGetByOriginHandler: TenantGetByOriginHandler,
        private readonly tenantPostHandler: TenantPostHandler,
        private readonly tenantPatchHandler: TenantPatchHandler,
        private readonly prisma: PrismaService,
    ) {}

    @Get('by-origin')
    async findTenantByOrigin(
        @Headers('origin') origin: string,
    ): Promise<Tenant> {
        return this.tenantGetByOriginHandler.handle(origin)
    }

    @Get('')
    async findOneTenant(
        @Query() query: FindOneTenantDto,
    ): Promise<TenantWithFeatures> {
        return this.tenantGetHandler.handle(query)
    }

    @Get(':id/workspaces')
    @Policy({
        subject: SubjectEnum.Tenant,
        action: ActionEnum.read,
    })
    async getWorkspaces(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Tenant> {
        return this.prisma.tenant.findUnique({
            where: {
                id: id,
            },
            include: {
                workspaces: true,
            },
        })
    }

    // TODO: Only the CMS should be able to query this route
    @Post('cms')
    async createTenantCMS(@Body() body: CreateTenantDto): Promise<Tenant> {
        return this.tenantCmsPostHandler.handle(body)
    }

    // TODO: Only the CMS should be able to query this route
    @Patch('cms/:id')
    async updateTenantCMS(
        @Body() body: UpdateTenantDto,
        @Param('id', ParseIntPipe) id: number,
    ): Promise<Tenant> {
        console.log('updateTenantCMS', body)
        return await this.tenantCmsPatchHandler.handle(body, id)
    }

    @UseGuards(IsDevGuard, JwtAuthGuard)
    @Post('')
    async createTenant(
        @Body() body: CreateTenantAppDto,
        @User() user: SanitizedUserDto,
    ): Promise<Tenant> {
        return this.tenantPostHandler.handle(body, user)
    }

    @UseGuards(IsDevGuard, JwtAuthGuard)
    @Patch(':id')
    async updateTenant(
        @Body() body: UpdateTenantFromWebAppDto,
        @Param('id') id: number,
    ): Promise<Tenant> {
        return this.tenantPatchHandler.handle(body, id)
    }
}
