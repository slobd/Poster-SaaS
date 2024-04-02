import { Prisma, WorkspaceVisibilityEnum } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class UpdateWorkspacesDto implements Prisma.WorkspaceUpdateInput {
    @IsString()
    @IsOptional()
    name?: string

    @IsString()
    @IsOptional()
    description?: string

    @IsOptional()
    @IsEnum(WorkspaceVisibilityEnum)
    visibility?: WorkspaceVisibilityEnum
}
