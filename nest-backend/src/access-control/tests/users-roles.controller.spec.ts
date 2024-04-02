import { Test, TestingModule } from '@nestjs/testing'
import { UsersRolesController } from '../users-roles/users-roles.controller'

describe('UserRolesController', () => {
    let controller: UsersRolesController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersRolesController],
        }).compile()

        controller = module.get<UsersRolesController>(UsersRolesController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
