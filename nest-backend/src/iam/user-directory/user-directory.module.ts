import { Module } from '@nestjs/common'
import { UserDirectoryService } from '@/iam/user-directory/user-directory.service'
import { UserDirectoryRepository } from '@/iam/user-directory/user-directory.repository'
import { UserAccountRepository } from '@/iam/user-account/user-account.repository'
import { UserAccountModule } from '@/iam/user-account/user-account.module'
import { UsersModule } from '@/iam/users/users.module'
import { IdentityProviderModule } from '@/identity-provider/identity-provider.module'

@Module({
    imports: [UserAccountModule, UsersModule, IdentityProviderModule],
    providers: [
        UserDirectoryService,
        UserDirectoryRepository,
        UserAccountRepository,
    ],
    exports: [UserDirectoryService, UserDirectoryRepository],
})
export class UserDirectoryModule {}
