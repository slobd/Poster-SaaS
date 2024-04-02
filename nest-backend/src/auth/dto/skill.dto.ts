import { Skill } from '@prisma/client'
import { IsString } from 'class-validator'

export class SkillDto implements Pick<Skill, 'name'> {
    @IsString()
    name: string
}
