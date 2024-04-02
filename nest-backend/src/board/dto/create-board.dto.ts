import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator'
import { PickType } from '@nestjs/swagger'
import { Project } from '@/project/project.entity'
import { Type } from 'class-transformer'
import { Task, TaskStatus } from '@prisma/client'

class CreateBoardDtoProject extends PickType(Project, [
    'visibility',
    'workspaceId',
]) {}

export class CreateBoardDtoTaskStatus
    implements Omit<TaskStatus, 'boardId' | 'createdAt' | 'id' | 'updatedAt'>
{
    @IsString()
    name: string
}

export class CreateBoardDtoTask
    implements Omit<Task, 'id' | 'statusId' | 'positionByStatus' | 'boardId' | 'dueDate' | 'createdAt' | 'updatedAt'>
{
    @IsString()
    status: string

    @IsString()
    title: string

    @IsString()
    description: string
}

export class CreateBoardDto {
    @IsInt()
    projectId: number

    @IsString()
    title: string

    @ValidateNested()
    @Type(() => CreateBoardDtoProject)
    project: CreateBoardDtoProject

    @ValidateNested({ each: true })
    @Type(() => CreateBoardDtoTaskStatus)
    @IsOptional()
    @IsArray()
    statuses?: CreateBoardDtoTaskStatus[]

    @ValidateNested({ each: true })
    @Type(() => CreateBoardDtoTask)
    @IsOptional()
    @IsArray()
    cards?: CreateBoardDtoTask[]
}
