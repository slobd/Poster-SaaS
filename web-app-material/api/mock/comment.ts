import faker from 'faker'
import { userMockTemplate } from './user'
import { Comment } from '~/types/entities/Comment.entity'
import { Poster } from '~/types/entities/Poster.entity'

export const commentMockTemplate = (config: Partial<Comment> = {}) => {
    const commentId = faker.datatype.number()
    return {
        id: commentId,
        createdAt: faker.date.recent(),
        author:
            config.author ??
            userMockTemplate({
                posters: [{ id: config.poster?.id ?? faker.datatype.number() } as Poster],
                authoredPosters: [{ id: config.poster?.id ?? faker.datatype.number() } as Poster],
                comments: [{ id: commentId } as Comment],
            }),
        content: faker.lorem.paragraph(),
        updatedAt: faker.date.recent(),
        poster: config.poster ?? { id: faker.datatype.number() },
        ...config,
    } as Comment
}

export const mockComments = (count = 1, config?: Partial<Comment>): Comment[] => {
    const comments: Comment[] = []

    for (let index = 0; index < count; index++) {
        const user = commentMockTemplate(config)
        comments.push(user)
    }
    return comments
}
