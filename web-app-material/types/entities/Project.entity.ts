import { InformationTab } from './InformationTab.entity'
import { ProjectVisibilityEnum } from './ProjectVisibility.entity'
import { Board } from '~/types/entities/Board.entity'

export interface Project {
    id: number

    name: string

    visibility: ProjectVisibilityEnum

    informationTabs: InformationTab[]

    boards: Board[]

    workspaceId: number
}
