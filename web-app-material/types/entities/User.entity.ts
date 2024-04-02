import { Comment } from './Comment.entity'
import { Poster } from './Poster.entity'
import { Role } from './Role.entity'
import { UploadResponse } from './Upload.entity'
import { Workspace } from '~/types/entities/Workspace.entity'
import { Skill } from '~/types/entities/Skill.entity'
import { UserAccount } from '~/types/entities/UserAccount.entity'

export interface User {
    id: number

    objectId: string

    isDummyUser: boolean

    organizationName?: string

    firstName: string

    lastName: string

    email: string

    password: string

    avatar: UploadResponse | null

    resetPasswordToken?: string

    confirmed: boolean

    subscribed: boolean

    privacyPolicy: boolean

    termOfUse: boolean

    workspaceSelected: boolean

    disableNotifications: boolean

    posters: Poster[]

    authoredPosters?: Poster[]

    roles?: Role[]

    comments?: Comment[]

    currentPosition?: string

    biography?: string

    workspaces: Workspace[]

    linkedin: string

    researchGate: string

    twitter: string

    skills: Skill[]

    userAccount: UserAccount[]
}
