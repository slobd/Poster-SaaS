import { UserRepository } from '@/iam/users/user.repository'
import { UsersService } from '@/iam/users/users.service'
import { MailService } from '@/mail/mail.service'
import { TenantService } from '@/tenant/tenant.service'
import { UploadsService } from '@/uploads/uploads.service'
import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthService } from '../auth.service'

describe('AuthService', () => {
    let service: AuthService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: createMock<UsersService>(),
                },
                {
                    provide: UserRepository,
                    useValue: createMock<UserRepository>(),
                },
                {
                    provide: UploadsService,
                    useValue: createMock<UploadsService>(),
                },
                {
                    provide: JwtService,
                    useValue: createMock<JwtService>(),
                },
                {
                    provide: MailService,
                    useValue: createMock<MailService>(),
                },
                {
                    provide: ConfigService,
                    useValue: createMock<ConfigService>(),
                },
                {
                    provide: TenantService,
                    useValue: createMock<TenantService>(),
                },
            ],
        }).compile()

        service = module.get<AuthService>(AuthService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
