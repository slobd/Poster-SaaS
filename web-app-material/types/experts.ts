import { Poster } from '~/types/entities/Poster.entity'
import { Skill } from '~/types/entities/Skill.entity'

export interface IExpert {
    id: number
    avatar: {
        // Url of the avatar image
        location: string
    }
    firstName: string
    lastName: string
    posters: Poster[]
    authoredPosters: Poster[]
    biography: string
    organizationName: string
    currentPosition: string
    linkedin: string
    researchGate: string
    twitter: string
    skills: Skill[]
    keywords: string[]
    topics: string[]
    activity: {
        // Number of documents
        documents: number
    }
}
