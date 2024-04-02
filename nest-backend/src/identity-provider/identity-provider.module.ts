import { Module } from '@nestjs/common'
import { IdentityProviderController } from '@/identity-provider/identity-provider.controller'
import { IdentityProviderRepository } from '@/identity-provider/identity-provider.repository'
import { IdentityProviderService } from '@/identity-provider/identity-provider.service'
import { UserAccountRepository } from '@/iam/user-account/user-account.repository'

@Module({
    imports: [],
    controllers: [IdentityProviderController],
    providers: [
        IdentityProviderRepository,
        IdentityProviderService,
        UserAccountRepository,
    ],
    exports: [IdentityProviderRepository, IdentityProviderService],
})
export class IdentityProviderModule {}
