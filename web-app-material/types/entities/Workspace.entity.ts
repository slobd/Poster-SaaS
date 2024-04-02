import { Project } from './Project.entity'
import { WorkspaceVisibilityEnum } from './WorkspaceVisibility.entity'

export interface Workspace {
    id: number

    name: string

    description?: string

    visibility: WorkspaceVisibilityEnum

    projects: Project[]

    tenantId: number
}
