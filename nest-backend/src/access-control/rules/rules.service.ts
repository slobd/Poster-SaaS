import { Injectable } from '@nestjs/common'
import { flatten } from 'lodash'
import { FeaturesRules } from '@/access-control/rules/rules.constants'
import {
    ActionEnum,
    FeaturesEnum,
    RawRuleWithFeature,
    RuleMetadata,
    SubjectEnum,
} from '@/access-control/access-control.types'
import { CreateRuleDto } from '@/access-control/entities/rule.entity'
import { Prisma, Rule } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'

interface DeleteMany {
    feature: string
    name: string
    options: any
    userId: number
    roleId: number
}

export interface FindAllRules {
    userId: number
    tenantId?: number
    feature?: string
    name?: string
    subject?: SubjectEnum
    action?: ActionEnum[]
    options?: any
}

@Injectable()
export class RulesService {
    constructor(private readonly prisma: PrismaService) {}

    async createMany(rules: CreateRuleDto[]): Promise<Prisma.BatchPayload> {
        return this.prisma.rule.createMany({
            data: getRuleCreateManyInput(rules),
        })
    }

    async create(rule: CreateRuleDto): Promise<Rule> {
        return this.prisma.rule.create({
            data: getRuleCreateInput(rule),
        })
    }

    async findAllRulesOfUser(where: FindAllRules): Promise<Rule[]> {
        return this.prisma.rule.findMany({
            where: {
                feature: where.feature,
                action: where.action
                    ? {
                          in: where.action,
                      }
                    : undefined,
                subject: where.subject,
                name: where.name,
                options: where.options
                    ? {
                          equals: where.options,
                      }
                    : undefined,
                OR: [
                    {
                        user: {
                            id: where.userId,
                        },
                    },
                    {
                        role: {
                            users: {
                                some: {
                                    user: {
                                        id: where.userId,
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        })
    }

    async findAllRawRulesOfUser(
        where: FindAllRules,
    ): Promise<RawRuleWithFeature[]> {
        const rules = await this.findAllRulesOfUser(where)

        const rawRules = rules.map((r) => {
            const ruleMetadata = FeaturesRules[r.feature][r.name]

            const conditions = ruleMetadata.getConditions(r.options)

            return {
                name: r.name,
                subject: r.subject,
                action: r.action,
                fields: r.fields,
                conditions: conditions.conditions,
                feature: r.feature,
            } as RawRuleWithFeature
        })

        rawRules.push(
            ...this.generateUserDefaultRules(where.userId, where.tenantId),
        )

        return rawRules
    }

    generateUserDefaultRules(userId, tenantId): RawRuleWithFeature[] {
        return [
            {
                subject: SubjectEnum.Comment,
                action: ActionEnum.delete,
                fields: null,
                conditions: {
                    'user.id': userId,
                },
                feature: FeaturesEnum.Comment,
            },
            {
                subject: SubjectEnum.Workspace,
                action: ActionEnum.list,
                fields: null,
                conditions: {
                    id: tenantId,
                },
                feature: FeaturesEnum.Workspace,
            },
        ] as RawRuleWithFeature[]
    }

    async deleteMany(rules: DeleteMany[]): Promise<Prisma.BatchPayload> {
        return this.prisma.rule.deleteMany({
            where: {
                OR: rules,
            },
        })
    }
}

export function getRulesMetadata(): RuleMetadata<any, any>[] {
    return flatten(
        Object.entries(FeaturesRules).map(([_key, value]) =>
            Object.entries(value).map(([_key, value]) => value),
        ),
    )
}

// export function getRulesFromDto(
//     rules: CreateRuleDto[],
// ): Prisma.RuleCreateManyInput[] {
//     return rules.map((rule) => {
//         const ruleCreateInput = getRuleCreateInput(rule)
//
//         return {
//             ...omit(ruleCreateInput, ['user']),
//             userId: ruleCreateInput.user.connect.id
//         }
//     })
// }

export function getRuleCreateInput(
    rule: CreateRuleDto,
): Prisma.RuleCreateInput {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { getConditions, description, ...ruleMetadata } =
        FeaturesRules[rule.feature][rule.name]

    // TODO: Validate rule options? (Or in a interceptor)

    const conditions = getConditions(rule.options)

    let ruleCreateInput: Prisma.RuleCreateInput = {
        ...ruleMetadata,
        fields: conditions.fields as string[],
        options: rule.options,
    }

    if (rule.userId) {
        ruleCreateInput = {
            ...ruleCreateInput,
            user: {
                connect: {
                    id: rule.userId,
                },
            },
        }
    }

    return ruleCreateInput
}

export function getRuleCreateManyInput(
    rules: CreateRuleDto[],
): Prisma.RuleCreateManyInput[] {
    return rules.map((rule) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { getConditions, description, ...ruleMetadata } =
            FeaturesRules[rule.feature][rule.name]

        // TODO: Validate rule options? (Or in a interceptor)

        const conditions = getConditions(rule.options)

        const ruleCreateInput: Prisma.RuleCreateManyInput = {
            ...ruleMetadata,
            fields: conditions.fields as string[],
            options: rule.options,
            userId: rule.userId ? rule.userId : null,
        }

        return ruleCreateInput
    })
}

// export function getCreateRuleDtoFromRuleMetadata(
//     ruleMetadata: RuleMetadata<any, any>,
//     options: Record<string, any>,
// ): CreateRuleDto {
//     return {
//         name: ruleMetadata.name,
//         feature: ruleMetadata.feature,
//         options,
//     }
// }

export function getRulesForDefaultRoles(
    rulesWithOptions: [RuleMetadata<any, any>, Record<string, any>][],
): CreateRuleDto[] {
    return rulesWithOptions.map((ruleWithOptions) => {
        const [ruleMetadata, options] = ruleWithOptions

        return {
            feature: ruleMetadata.feature,
            name: ruleMetadata.name,
            // subject: ruleMetadata.subject,
            // action: ruleMetadata.action,
            options,
            // fields: options.fields,
        }
    })
}
