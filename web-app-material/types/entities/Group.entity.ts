import { GroupVisibilityEnum } from './GroupVisibility.entity'
import { Poster } from './Poster.entity'
import { User } from './User.entity'
import { UploadResponse } from './Upload.entity'
import { Tenant } from './Tenant.entity'

export interface Group {
    id: number

    name: string

    description: string

    image: UploadResponse

    visibility: GroupVisibilityEnum

    manager: User

    members: User[]

    posters: Poster[]

    createdAt: Date

    updatedAt: Date

    tenant?: Tenant
}
