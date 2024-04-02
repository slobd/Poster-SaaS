import { Poster } from './Poster.entity'
import { User } from './User.entity'

export interface Author {
    id: number

    name: string

    organization: string

    email: string

    user?: User

    registered: boolean

    poster: Poster
}
