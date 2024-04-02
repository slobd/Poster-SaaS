import { SanitizedUserDto } from '@/iam/users/dto/sanitized-user.dto'
import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common'
import { FindPosterDto } from '../dto/find-poster.dto'

import { PosterDto, PosterRepository } from '../poster.repository'
import { PosterVisibilityEnum } from '@prisma/client'

@Injectable({})
export class PostersGetHandler {
    private readonly logger = new Logger(PostersGetHandler.name)

    constructor(private readonly posterRepository: PosterRepository) {}

    async handle(
        query: FindPosterDto,
        workspaceId: number,
        user: SanitizedUserDto,
    ): Promise<PosterDto[]> {
        console.log('query', query)
        try {
            if (this.isSearchQuery(query)) {
                console.log('Is Search')
                return this.search(query, user?.id, workspaceId)
            } else {
                console.log('Is find')
                return this.find(query, user?.id, workspaceId)
            }
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }

    private isSearchQuery(query: FindPosterDto): boolean {
        // If query include any of those keys. We will use search instead of find
        const searchQueryParams = ['search']
        for (const param of searchQueryParams) {
            if (
                param in query &&
                query[param].length > 0 &&
                query[param][0].length > 0
            ) {
                return true
            }
        }
        return false
    }

    private async find(
        { visibility, skip, take }: FindPosterDto,
        userId: number,
        workspaceId: number,
    ): Promise<PosterDto[]> {
        try {
            return await this.posterRepository.findMany(
                {
                    visibility:
                        visibility === PosterVisibilityEnum.PUBLIC
                            ? PosterVisibilityEnum.PUBLIC
                            : undefined,
                    workspace: {
                        id: workspaceId,
                    },
                    OR:
                        visibility === PosterVisibilityEnum.PRIVATE
                            ? [
                                  {
                                      user: {
                                          id: userId,
                                      },
                                  },
                                  {
                                      authors: {
                                          some: {
                                              id: userId,
                                          },
                                      },
                                  },
                              ]
                            : undefined,
                },
                skip,
                take,
            )
        } catch (error) {
            this.logger.error(error)
            throw error
        }
    }

    async search(
        query: FindPosterDto,
        userId?: number,
        workspaceId?: number,
    ): Promise<PosterDto[]> {
        const { visibility, skip, take, search: s } = query

        const search = s.trim()

        const posters = await this.posterRepository.findMany(
            {
                visibility:
                    visibility === PosterVisibilityEnum.PUBLIC
                        ? PosterVisibilityEnum.PUBLIC
                        : undefined,
                workspace: {
                    id: workspaceId,
                },
                AND: [
                    {
                        OR:
                            visibility === PosterVisibilityEnum.PRIVATE
                                ? [
                                      {
                                          user: {
                                              id: userId,
                                          },
                                      },
                                      {
                                          authors: {
                                              some: {
                                                  id: userId,
                                              },
                                          },
                                      },
                                  ]
                                : undefined,
                    },
                    {
                        OR: [
                            {
                                title: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                description: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                authors: {
                                    some: {
                                        OR: [
                                            {
                                                firstName: {
                                                    contains: search,
                                                    mode: 'insensitive',
                                                },
                                            },
                                            {
                                                lastName: {
                                                    contains: search,
                                                    mode: 'insensitive',
                                                },
                                            },
                                            {
                                                organizationName: {
                                                    contains: search,
                                                    mode: 'insensitive',
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                keywords: {
                                    some: {
                                        name: {
                                            contains: search,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                            {
                                topics: {
                                    some: {
                                        name: {
                                            contains: search,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
            skip,
            take,
        )
        // const qb = this.createPosterSelectQueryBuilder()
        // console.log('POSTERS :', (await qb.getMany())[0].user)
        //
        // this.modifyQueryBasedOnVisibility(qb, visibility, userId, tenant)
        //
        // qb.andWhere(this.getSearchWhereQuery(query, qb))
        //
        // if (skip) {
        //     qb.skip(skip)
        // }
        //
        // if (take) {
        //     qb.take(take)
        // }

        return posters
    }

    // private getSearchWhereQuery(
    //     query: FindPosterDto,
    //     queryBuilder: SelectQueryBuilder<Poster>,
    // ): Brackets {
    //     const { title, topics, keywords, organizations, authors, or } = query
    //
    //     return new Brackets((sqb) => {
    //         if (title) {
    //             if (or) {
    //                 sqb.orWhere("poster.title ILIKE '%' || :title || '%'", {
    //                     title,
    //                 })
    //             } else {
    //                 sqb.andWhere('poster.title ILIKE :title', {
    //                     title,
    //                 })
    //             }
    //         }
    //
    //         if (authors?.length) {
    //             for (const author of authors) {
    //                 const query = { fullName: author }
    //                 const fullNameConcat =
    //                     "authors.firstName || ' ' || authors.lastName ILIKE "
    //
    //                 if (or) {
    //                     sqb.orWhere(
    //                         fullNameConcat + "'%' || :fullName || '%'",
    //                         query,
    //                     )
    //                 } else {
    //                     sqb.andWhere(fullNameConcat + ':fullName', query)
    //                 }
    //             }
    //         }
    //
    //         if (organizations?.length) {
    //             for (const organization of organizations) {
    //                 if (or) {
    //                     sqb.orWhere(
    //                         "user.organizationName  ILIKE '%' || :organization || '%'",
    //                         { organization },
    //                     )
    //                     sqb.orWhere(
    //                         "authors.organizationName  ILIKE '%' || :organization || '%'",
    //                         { organization },
    //                     )
    //                 } else {
    //                     sqb.andWhere(
    //                         'user.organizationName ILIKE :organization',
    //                         {
    //                             organization,
    //                         },
    //                     )
    //                     sqb.andWhere(
    //                         'authors.organizationName ILIKE :organization',
    //                         {
    //                             organization,
    //                         },
    //                     )
    //                 }
    //             }
    //         }
    //
    //         if (topics && topics.length > 0) {
    //             for (const [index, topic] of topics.entries()) {
    //                 const getIdOfPosterInJoinTable = queryBuilder
    //                     .subQuery()
    //                     .select('pk_join.posterId')
    //                     .from('poster_topics_topic', 'pk_join')
    //                     .where(
    //                         `pk_join.topicName ILike '%' || :t${index} || '%'`,
    //                         {
    //                             [`t${index}`]: topic,
    //                         },
    //                     )
    //                     .getQuery()
    //
    //                 if (or) {
    //                     sqb.orWhere('poster.id IN ' + getIdOfPosterInJoinTable)
    //                 } else {
    //                     sqb.andWhere('poster.id IN ' + getIdOfPosterInJoinTable)
    //                 }
    //             }
    //         }
    //
    //         if (keywords && keywords.length > 0) {
    //             for (const [index, keyword] of keywords.entries()) {
    //                 const getIdOfPosterInJoinTable = queryBuilder
    //                     .subQuery()
    //                     .select('pk_join.posterId')
    //                     .from('poster_keywords_keyword', 'pk_join')
    //                     .where(
    //                         `pk_join.keywordName ILike '%' || :k${index} || '%'`,
    //                         {
    //                             [`k${index}`]: keyword,
    //                         },
    //                     )
    //                     .getQuery()
    //
    //                 if (or) {
    //                     sqb.orWhere('poster.id IN ' + getIdOfPosterInJoinTable)
    //                 } else {
    //                     sqb.andWhere('poster.id IN ' + getIdOfPosterInJoinTable)
    //                 }
    //             }
    //         }
    //     })
    // }
}
