import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'

export class FindAllRulesDto {
    @IsString()
    @IsOptional()
    feature?: string

    @IsString()
    @IsOptional()
    name?: string

    @IsEnum(SubjectEnum)
    @IsOptional()
    subject?: SubjectEnum

    @IsEnum(ActionEnum, { each: true })
    @IsArray()
    @IsOptional()
    action?: ActionEnum[]

    @IsOptional()
    options?: any
}
