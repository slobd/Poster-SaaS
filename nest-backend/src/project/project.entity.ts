import { Project as PrismaProject, ProjectVisibilityEnum } from '@prisma/client'
import { IsEnum, IsInt } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class Project implements PrismaProject {
    id: number

    name: string

    @IsEnum(ProjectVisibilityEnum)
    @ApiProperty({ enum: ProjectVisibilityEnum })
    visibility: ProjectVisibilityEnum

    @IsInt()
    workspaceId: number

    ownerId: number | null

    deleted: boolean

    createdAt: Date

    updatedAt: Date
}
