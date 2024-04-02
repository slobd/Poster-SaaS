import {
    IsArray,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class AssigneeDto {
    @IsInt()
    id: number
}

export class UpdateTaskDto {
    @IsString()
    @IsOptional()
    title?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsInt()
    statusId?: number

    @IsNumber()
    @IsOptional()
    positionByStatus?: number

    @IsString()
    @IsOptional()
    dueDate?: Date

    @IsArray()
    @ValidateNested()
    @IsOptional()
    @Type(() => AssigneeDto)
    assignees?: AssigneeDto[]
}
