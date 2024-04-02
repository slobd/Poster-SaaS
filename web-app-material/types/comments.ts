import { Comment } from './entities/Comment.entity'

export interface UComment extends Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'poster'> {
    posterId: number
    workspace: {
        id: number | null
        tenantId: number | null
    }
}

export enum NotificationState {
    FAILURE = 'failure',
    SUCCESS = 'success',
    NONE = 'none',
}
