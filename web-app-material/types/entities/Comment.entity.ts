import { Poster } from './Poster.entity'
import { User } from './User.entity'

export interface Comment {
    id: number
    author: User
    poster: Poster
    content: string
    createdAt: Date
    updatedAt: Date
}
