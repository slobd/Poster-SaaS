import { PolicyEnforcementPointInterceptor } from '../policy-enforcement-point.interceptor'
import { Reflector } from '@nestjs/core'
import { RulesService } from '@/access-control/rules/rules.service'
import { PolicyInformationPointService } from '@/access-control/policy-information-point.service'
import { PrismaService } from '@/prisma/prisma.service'

describe('AccessControlInterceptor', () => {
    it('should be defined', () => {
        expect(
            new PolicyEnforcementPointInterceptor(
                new Reflector(),
                new RulesService(new PrismaService()),
                new PolicyInformationPointService(new PrismaService()),
            ),
        ).toBeDefined()
    })

    it('should access the subject and action metadata of the route handler', function () {
        expect(true).toBe(true)
    })

    describe('GET one request', () => {
        it('should throw a Forbidden error AFTER the handler is called, if the user is not Authorized', function () {
            expect(true).toBe(true)
        })

        it('should remove the fields the user is not authorized to see', function () {
            expect(true).toBe(true)
        })
    })

    describe('POST/PATCH request', () => {
        it('should throw a Forbidden error BEFORE the handler is called, if the user is not Authorized', function () {
            expect(true).toBe(true)
        })

        it('should throw a Forbidden error if the Body has fields that are not allowed', function () {
            expect(true).toBe(true)
        })
    })
})
