import { User } from '~/sdk'

export interface ProjectTaskStatus {
    id: number
    name: string
    boardId: number
    createdAt: string
    updatedAt: string
}

export interface ProjectTaskItemAttachment {
    acl: string
    bucket: string
    contentDisposition: string
    contentType: string
    encoding: string
    etag: string
    fieldname: string
    id: number
    informationTabId: number
    key: string
    location: string
    metadata: string
    mimetype: string
    originalname: string
    serverSideEncryption: string
    size: number
    storageClass: string
    taskId: number
}

export interface ProjectTaskItem {
    id: number
    title: string
    description: string
    dueDate: string
    status: ProjectTaskStatus
    positionByStatus: string
    assignees: User[]
    attachments: ProjectTaskItemAttachment[]
    createdAt: string
    updatedAt: string

    // front-end helpers
    position: number
}
