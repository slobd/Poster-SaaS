import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { MailModule } from '@/mail/mail.module'
import { UsersController } from './users.controller'
import { UserRepository } from './user.repository'
import { AzureModule } from '@/azure/azure.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
    imports: [
        MailModule,
        AzureModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get('JWT_SECRET'),
                    signOptions: {
                        expiresIn: '1d',
                    },
                }
            },
        }),
    ],
    providers: [UsersService, UserRepository],
    controllers: [UsersController],
    exports: [UsersService, UserRepository],
})
export class UsersModule {}
