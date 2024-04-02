import { Project } from '~/types/entities/Project.entity'
import { ProjectTaskItem, ProjectTaskStatus } from '~/types/projectTasks'

export interface Board {
    id: number

    statuses: ProjectTaskStatus[]

    tasks: ProjectTaskItem[]

    project: Project

    projectId: string

    createdAt: string

    updatedAt: string
}
