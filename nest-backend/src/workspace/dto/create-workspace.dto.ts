import { WorkspaceVisibilityEnum } from '@prisma/client'
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateWorkspaceDto {
    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description: string

    @IsEnum(WorkspaceVisibilityEnum)
    visibility: WorkspaceVisibilityEnum

    @IsNumber()
    tenantId: number
}
