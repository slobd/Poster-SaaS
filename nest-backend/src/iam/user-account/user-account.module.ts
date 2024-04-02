import { Module } from '@nestjs/common'
import { UserAccountService } from '@/iam/user-account/user-account.service'
import { UserAccountRepository } from '@/iam/user-account/user-account.repository'
import { IdentityProviderModule } from '@/identity-provider/identity-provider.module'

@Module({
    imports: [IdentityProviderModule],
    providers: [UserAccountService, UserAccountRepository],
    exports: [UserAccountService, UserAccountRepository],
})
export class UserAccountModule {}
