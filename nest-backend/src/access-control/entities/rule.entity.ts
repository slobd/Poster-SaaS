import {
    FeaturesEnum,
    GalleryRules,
} from '@/access-control/access-control.types'
import { IsEnum } from 'class-validator'

export class CreateRuleDto {
    @IsEnum(FeaturesEnum)
    feature: string

    @IsEnum({
        ...GalleryRules,
    })
    name: string

    options: Record<string, any>

    userId?: number
}
