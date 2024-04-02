import { UsersService } from '@/iam/users/users.service'
import { TenantService } from '@/tenant/tenant.service'
import { UploadsService } from '@/uploads/uploads.service'
import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'

describe('Auth Controller', () => {
    let controller: AuthController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: createMock<AuthService>(),
                },
                {
                    provide: UploadsService,
                    useValue: createMock<UploadsService>(),
                },
                {
                    provide: UsersService,
                    useValue: createMock<UsersService>(),
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

        controller = module.get<AuthController>(AuthController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
