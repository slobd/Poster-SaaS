import { Test, TestingModule } from '@nestjs/testing'
import { UsersRolesService } from '../users-roles/users-roles.service'

describe('UserRolesService', () => {
    let service: UsersRolesService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UsersRolesService],
        }).compile()

        service = module.get<UsersRolesService>(UsersRolesService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
