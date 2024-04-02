import { Controller, Get, Query } from '@nestjs/common'
import { IdentityProviderRepository } from '@/identity-provider/identity-provider.repository'
import { FindOneIdentityProviderDto } from '@/identity-provider/dto/find-identity-provider.dto'
import { IdentityProviderService } from '@/identity-provider/identity-provider.service'
import { IdentityProvider } from '@prisma/client'
import { ApiTags } from '@nestjs/swagger'

@Controller('identity-provider')
@ApiTags('Identity Providers')
export class IdentityProviderController {
    constructor(
        private readonly identityProviderRepository: IdentityProviderRepository,
        private readonly identityProviderService: IdentityProviderService,
    ) {}

    @Get()
    async findAllIdp(
        @Query() query: FindOneIdentityProviderDto,
    ): Promise<IdentityProvider[]> {
        return this.identityProviderRepository.findAll(query)
    }

    @Get('email')
    async findIdpByDomain(
        @Query() query: FindOneIdentityProviderDto,
    ): Promise<IdentityProvider> {
        return this.identityProviderService.findIdpFromEmail(query.email)
    }
}
