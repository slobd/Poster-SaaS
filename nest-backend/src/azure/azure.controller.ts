import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import {
    AzureUser,
    AzureUserService,
    CreateAzureUser,
} from '@/azure/azure-user.service'
import { IsDevGuard } from '@/utils/guards/is-dev.guard'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'

@Controller('azure')
@ApiTags('Azure')
export class AzureController {
    constructor(
        private azureUserService: AzureUserService,
        private configService: ConfigService,
    ) {}

    @UseGuards(IsDevGuard)
    @Get('users')
    async find(): Promise<AzureUser[]> {
        return this.azureUserService.findManyUsers()
    }

    @Get('users/email')
    async findOne(@Query('email') email: string): Promise<boolean> {
        return !!(await this.azureUserService.findOneByEmail(email))
    }

    @UseGuards(IsDevGuard)
    @Get('users/:id')
    async findOneByEmail(@Param('id') id: string): Promise<AzureUser> {
        return this.azureUserService.findOneUser(id)
    }

    @UseGuards(IsDevGuard)
    @Post('users')
    async create(): Promise<AzureUser> {
        const issuer = this.configService.get('LOCAL_ACCOUNT_ISSUER')
        const body: CreateAzureUser = {
            displayName: 'Max Mustermann',
            accountEnabled: true,
            passwordProfile: {
                forceChangePasswordNextSignIn: false,
                password: 'Gutenberg2020',
            },
            identities: [
                {
                    issuer: `${issuer}.onmicrosoft.com`,
                    signInType: 'emailAddress',
                    issuerAssignedId: 'max.mustermann.1@gmail.com',
                },
            ],
        }
        return this.azureUserService.create(body)
    }
}
