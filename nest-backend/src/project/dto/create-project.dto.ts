import { Type } from 'class-transformer'
import { IsInt, IsString } from 'class-validator'

export class CreateProjectDto {
    @IsString()
    name: string

    @IsInt()
    @Type(() => Number)
    workspaceId: number

    @IsInt()
    @Type(() => Number)
    tenantId: number
}
