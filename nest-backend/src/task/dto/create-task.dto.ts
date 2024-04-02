import { IsInt, IsString, ValidateNested } from 'class-validator'
import { Board } from '@/board/entities/board.entity'
import { PickType } from '@nestjs/swagger'
import { Project } from '@/project/project.entity'
import { Type } from 'class-transformer'

class CreateTaskDtoProject extends PickType(Project, [
    'visibility',
    'workspaceId',
]) {}

class CreateTaskDtoBoard extends PickType(Board, ['id'] as const) {
    @ValidateNested()
    @Type(() => CreateTaskDtoProject)
    project: CreateTaskDtoProject

    @IsInt()
    tenantId: number
}

export class CreateTaskDto {
    @IsString()
    title: string

    @IsString()
    description: string

    @IsInt()
    statusId: number

    @ValidateNested()
    @Type(() => CreateTaskDtoBoard)
    board: CreateTaskDtoBoard
}
