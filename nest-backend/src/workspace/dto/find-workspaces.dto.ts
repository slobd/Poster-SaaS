import { IsInt, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class FindWorkspacesDto {
    @IsInt()
    @Type(() => Number)
    tenantId: number

    @IsOptional()
    @IsString()
    search: string
}
