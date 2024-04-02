import { toPairs } from 'lodash'
import { RulesService } from '@/access-control/rules/rules.service'
import { FindAllRulesDto } from '@/access-control/dto/find-all-rules.dto'
import { RawRuleWithFeature } from '@/access-control/access-control.types'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersRulesGetHandler {
    constructor(private readonly rulesService: RulesService) {}

    async handle(
        query: FindAllRulesDto,
        userId: number,
    ): Promise<RawRuleWithFeature[]> {
        if (query.options)
            query.options = toPairs(query.options).reduce((preV, currV) => {
                const [key, val] = currV
                preV[key] = isNaN(val as number) ? val : parseInt(val as string)
                return preV
            }, {})
        return this.rulesService.findAllRawRulesOfUser({
            ...query,
            userId,
        })
    }
}
