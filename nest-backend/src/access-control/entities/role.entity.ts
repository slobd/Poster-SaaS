import { CreateRuleDto } from '@/access-control/entities/rule.entity'
import { Prisma } from '@prisma/client'
import { IsArray } from 'class-validator'

const roleWithRules = Prisma.validator<Prisma.RoleArgs>()({
    include: {
        rules: true,
    },
})

export type RoleWithRules = Prisma.RoleGetPayload<typeof roleWithRules>

export class CreateRoleDto {
    name: string
    domain: string
    description: string
    rules: CreateRuleDto[]
}

export class UpdateRoleDto {
    id: number
    name?: string
    domain?: string
    description?: string

    @IsArray()
    rules: CreateRuleDto[]
}

export type SystemCreateRoleDto = CreateRoleDto & { system?: boolean }
