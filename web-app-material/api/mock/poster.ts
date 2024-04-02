import faker from 'faker'
import { mockUsers } from './user'
import { mockImages, mockImageTemplate, mockPosterUploads } from './shared'
import { mockComments } from './comment'
import { tenantMockTemplate } from './tenant'
import { Poster } from '~/types/entities/Poster.entity'
import { PosterVisibilityEnum } from '~/types/entities/PosterVisibility.entity'
import { PDFLayout } from '~/types/canvas'
import { PosterTypeEnum } from '~/types/entities/PosterType.entity'
import { Keyword } from '~/types/entities/Keyword.entity'
import { Topic } from '~/types/entities/Topic.entity'
import { PosterContent } from '~/types/entities/PosterContent.entity'

// Yes performance do matter
const generateMockKeywordsOrTopics = (
    count = 5,
    type: 'keyword' | 'topic' = 'keyword',
    nameType: 'string' | 'object'
): Keyword[] | Topic[] => {
    if (nameType === 'string') {
        const keywordsOrTopics = new Array(count)
        for (let index = 0; index < count; index++) {
            keywordsOrTopics[index] = type === 'keyword' ? faker.lorem.word() : faker.lorem.words()
        }

        return keywordsOrTopics
    }

    const keywordsOrTopics = new Array(count)
    for (let index = 0; index < count; index++) {
        keywordsOrTopics[index] = {
            name: type === 'keyword' ? faker.lorem.word() : faker.lorem.words(),
        }
    }

    return keywordsOrTopics
}

export const posterContentMockTemplate = (image: number = 0, posterId?: number): PosterContent => {
    if (image)
        return {
            id: faker.datatype.number(),
            images: mockImages(image),
            name: faker.lorem.lines(),
            simpleText: faker.lorem.paragraphs(),
            structuredText: faker.lorem.paragraphs(),
            poster: posterId ? { id: posterId } : { id: faker.datatype.number() },
        } as PosterContent

    return {
        id: faker.datatype.number(),
        images: [],
        name: faker.lorem.lines(),
        simpleText: faker.lorem.paragraphs(),
        structuredText: faker.lorem.paragraphs(),
        poster: posterId ? { id: posterId } : { id: faker.datatype.number() },
    } as any as PosterContent
}

// Yes performance do matter
const generateMockPosterContent = (count = 6, image = 0, posterId?: number): PosterContent[] => {
    const posterContents: PosterContent[] = new Array(count)
    for (let index = 0; index < count; index++) {
        posterContents[index] = posterContentMockTemplate(image, posterId)
    }

    return posterContents
}

export const posterMockTemplate = (
    config = {} as Partial<Poster>,
    nameType: 'string' | 'object'
): Poster => {
    const posterId = config.id ?? faker.datatype.number()
    const authors =
        config.authors ??
        mockUsers(faker.datatype.number({ min: 5, max: 10 }), {
            isDummyUser: true,
            posters: [{ id: posterId } as Poster],
            authoredPosters: [{ id: posterId } as Poster],
        })
    return {
        id: posterId,
        title: faker.hacker.phrase(),
        createdAt: faker.date.recent(),
        summary: faker.lorem.paragraphs(),
        description: faker.hacker.phrase(),
        visibility:
            nameType === 'object'
                ? faker.helpers.randomize(
                      Object.values(PosterVisibilityEnum).map((value) => ({ name: value }))
                  )
                : (faker.helpers.randomize(Object.values(PosterVisibilityEnum)) as any),
        updatedAt: faker.date.recent(),
        authors,
        user: config.user ?? {
            ...faker.helpers.randomize(authors),
            isDummyUser: false,
            confirmed: true,
            termOfUse: true,
            privacyPolicy: true,
            posters: [{ id: posterId } as Poster],
        },
        layout: faker.helpers.randomize(Object.values(PDFLayout)),
        type:
            nameType === 'object'
                ? faker.helpers.randomize(
                      Object.values(PosterTypeEnum).map((value) => ({ name: value }))
                  )
                : (faker.helpers.randomize(Object.values(PosterTypeEnum)) as any),
        ...mockPosterUploads[faker.datatype.number({ min: 1, max: 5 })],
        keywords:
            config.keywords ??
            generateMockKeywordsOrTopics(faker.datatype.number(10), 'keyword', nameType),
        topics:
            config.topics ??
            generateMockKeywordsOrTopics(faker.datatype.number(10), 'topic', nameType),

        onlineSessionLink: faker.internet.url(),
        comments:
            config.comments ??
            mockComments(faker.datatype.number({ min: 2, max: 10 }), {
                poster: { id: posterId } as Poster,
                author: faker.helpers.randomize(authors),
            }),
        tenant:
            config.tenant ??
            tenantMockTemplate({ posters: [{ id: posterId } as Poster], roles: [] }),
        posterContent:
            config.posterContent ??
            generateMockPosterContent(faker.datatype.number(6), faker.datatype.number(3), posterId),
        findings: config.findings ?? {
            id: faker.datatype.number(),
            image: mockImageTemplate('image'),
            simpleText: faker.lorem.paragraphs(),
            structuredText: faker.lorem.paragraphs(),
            poster: { id: posterId } as Poster,
        },
        ...config,
    }
}

export const mockPosters = (
    count = 1,
    config?: Partial<Poster>,
    nameType: 'string' | 'object' = 'object'
): Poster[] => {
    const posters: Poster[] = []
    for (let index = 0; index < count; index++) {
        const poster = posterMockTemplate(config, nameType)
        posters.push(poster)
    }
    return posters
}
