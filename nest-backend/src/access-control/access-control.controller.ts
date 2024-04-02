import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'

import {
    getRulesMetadata,
    RulesService,
} from '@/access-control/rules/rules.service'
import {
    RawRuleWithFeature,
    RuleMetadata,
} from '@/access-control/access-control.types'
import { Rule } from '@prisma/client'
import { CreateRuleDto } from '@/access-control/entities/rule.entity'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import { User } from '@/utils/decorators/user.decorator'
import { PolicyEnforcementPointInterceptor } from '@/access-control/policy-enforcement-point.interceptor'
import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import { UsersRulesGetHandler } from '@/access-control/handlers/users-rules-get.handler'
import { FindAllRulesDto } from '@/access-control/dto/find-all-rules.dto'
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'
import { ApiTags } from '@nestjs/swagger'

@Controller('access-control')
@ApiTags('Access Control')
@UseGuards(JwtAuthGuard)
@UseInterceptors(PolicyEnforcementPointInterceptor)
export class AccessControlController {
    constructor(
        private readonly rulesService: RulesService,
        private readonly usersRulesGetHandler: UsersRulesGetHandler,
    ) {}

    @Get('rules/metadata')
    @UseGuards(IsDevGuard)
    getRulesMetadata(): RuleMetadata<any, any>[] {
        return getRulesMetadata()
    }

    @Get('users/me/rules')
    async getCurrentUserRules(
        @User() user: SanitizedUserDto,
        @Query() query: FindAllRulesDto,
    ): Promise<RawRuleWithFeature[]> {
        console.log('users/me/rules')
        return this.usersRulesGetHandler.handle(query, user.id)
    }

    @Get('users/:id/rules')
    @UseGuards(IsDevGuard)
    getUserRules(
        @Param('id', ParseIntPipe) id: number,
        @Query() query: FindAllRulesDto,
    ): Promise<RawRuleWithFeature[]> {
        return this.usersRulesGetHandler.handle(query, id)
    }

    @Post('users/:id/rules')
    @UseGuards(IsDevGuard)
    createRuleForUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateRuleDto,
    ): Promise<Rule> {
        return this.rulesService.create({
            ...body,
            userId: id,
        })
    }
}
