/* eslint-disable @typescript-eslint/no-unused-vars */
import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { MorrisonColorPalette, PDFLayout, PDFType } from '~/types/canvas'
import { PosterTypeEnum } from '~/types/entities/PosterType.entity'
import { PosterVisibilityEnum } from '~/types/entities/PosterVisibility.entity'
import { UploadResponse } from '~/types/entities/Upload.entity'
import { Poster } from '~/types/entities/Poster.entity'
import { APIRoutes } from '~/types/typing'
import { User } from '~/types/entities/User.entity'
import useCanvas from '~/composables/canvas/useCanvas'
import { getBase64ImageFromURL } from '~/composables/canvas/use/useUtils'

const initialState = {
    posterUploadState: {
        loading: false,
        error: false,
        posterId: null,
    },

    // Tells the user all changes will be lost after reloading
    askOnReload: false,

    poster: {} as Poster,

    title: '',
    // Morrison specific
    finding: {
        name: 'Finding',
        simpleText: '',
        structuredText: '',
        placeholder: 'Main finding goes here. Keep it short and simple.',
        image: { fieldname: '', location: '' } as UploadResponse,
    },
    category: MorrisonColorPalette.THEORY,
    authors: [] as Partial<User>[],
    blocks: [
        {
            name: 'Introduction',
            simpleText: '',
            structuredText: '',
            placeholder:
                'You never get a second chance to make a first impression. Capture your readers interest, make them want to read the rest of your poster! Tell them about the purpose of your work and the novelty of your results.',
            images: [] as UploadResponse[],
        },
        {
            name: 'Methods',
            simpleText: '',
            structuredText: '',
            placeholder:
                'The methods section should describe, in logical sequence, how your study was designed and carried out, and how you analysed your data. Some examples include the duration of the study, inclusion/exclusion criteria, statistical or laboratory techniques, key interventions and primary outcome measures.',
            images: [] as UploadResponse[],
        },
        {
            name: 'Results',
            simpleText: '',
            structuredText: '',
            placeholder:
                'What have you found out? Break down the data into sentences that show its significance to the research question. If your work is still in progress you can present the output achieved thus far or the results that you might expect.',
            images: [] as UploadResponse[],
        },
        {
            name: 'Conclusion',
            simpleText: '',
            structuredText: '',
            placeholder:
                'Have a strong take-home message! If a reader would remember only one sentence from your poster, what should it be? Restate your aims and objectives, and summarize your main findings and evidence for the reader.',
            images: [] as UploadResponse[],
        },
        {
            name: 'Reference',
            simpleText: '',
            structuredText: '',
            placeholder:
                'Your references should include author, year of publication, title and publisher or URL in an alphabetical order. Look up the two most common formats APA or Harvard.',
            images: [] as UploadResponse[],
        },
        {
            name: 'Acknowledgment',
            simpleText: '',
            structuredText: '',
            placeholder:
                'A sponsoring organization, a funding body, other researchers or even family and friends. There a many people who have helped in some way in the preparation of the research. There is no right or wrong way to acknowledge people, and who you want to acknowledge is down to personal preference.',
            images: [] as UploadResponse[],
        },
    ],
    layout: PDFLayout.CLASSIC_LANDSCAPE,

    visibility: PosterVisibilityEnum.PRIVATE,

    keywords: [] as string[],

    topics: [] as string[],

    description: '',
}

export const state = () => initialState

export type CanvasState = ReturnType<typeof state>

export const getters = getterTree(state, {
    getPosterUploadState(state) {
        return state.posterUploadState
    },
    getPoster(state) {
        const blocksCopy = state.blocks.map((block) => {
            const { placeholder, ...restBlock } = block
            return {
                ...restBlock,
                images: block.images.map((image) => {
                    const { url, ...rest } = image
                    return rest
                }),
            }
        })
        return {
            id: state.poster?.id ?? null,
            user: state.poster?.user ?? null,
            title: state.title,
            layout: state.layout,
            authors: [...state.authors],
            posterContent: [...blocksCopy],
            findings: state.layout.includes(PDFType.MORRISON) ? state.finding : null,
            type: { name: PosterTypeEnum.CANVAS },
            visibility: { name: state.visibility },
            description: state.description,
            topics: state.topics.map((name) => ({
                name,
            })),
            keywords: state.keywords.map((name) => ({
                name,
            })),
        }
    },
    getVisibility(state) {
        return state.visibility
    },
    getAskOnReload(state) {
        return state.askOnReload
    },
    getLayout(state) {
        return state.layout
    },
    getBlocks(state) {
        if (state.layout.includes(PDFType.MORRISON)) return state.blocks.slice(0, 4)
        return state.blocks
    },
    getAuthors(state) {
        return state.authors
    },
    getTitleBlock(state) {
        return state.title
    },
    getFindingBlock(state) {
        return state.finding
    },
    getTitle(state) {
        return state.title
    },
    /**
     * @deprecated
     * @param state
     */
    getFinding(state) {
        return state.finding.simpleText
    },
    getCategory(state) {
        return state.category
    },
    getDescription(state) {
        return state.description
    },
    getKeywords(state) {
        return state.keywords
    },
    getTopics(state) {
        return state.topics
    },
})

export const mutations = mutationTree(state, {
    setPosterUploadState(state, payload) {
        for (const key in payload) {
            state.posterUploadState[key] = payload[key]
        }
    },
    setVisibility(state, payload: { visibility: PosterVisibilityEnum }) {
        state.visibility = payload.visibility
    },
    setAskOnReload(state) {
        state.askOnReload = true
    },
    updateTitle(state, payload: { value: string }) {
        state.title = payload.value
    },
    addFinding(state, payload) {
        state.finding = payload
    },
    updateFinding(state, payload: { value: string }) {
        state.finding.simpleText = payload.value
    },
    updateCategory(state, payload: { category: MorrisonColorPalette }) {
        state.category = payload.category
    },
    setAuthor(state, author: User) {
        state.authors.push(author)
    },
    clearAuthors(state) {
        state.authors = []
    },
    addAuthor(state, { firstName = '', lastName = '', email = '', organization = '', ...rest }) {
        state.authors.push({
            firstName,
            lastName,
            email,
            organization,
            ...rest,
        } as User)
    },
    removeAuthor(state, payload: { index: number }) {
        const { index } = payload
        state.authors.splice(index, 1)
    },
    updateAuthor(
        state,
        payload: {
            index: number
            key: 'firstName' | 'lastName' | 'email' | 'organizationName'
            value: string
        }
    ) {
        const { index, key, value } = payload

        state.authors[index][key] = value
    },
    // TODO implement a custom reset block to set only needed fields
    // when user switch from morrison to classic add only not yet present fields
    resetBlocks(state) {
        state.blocks = initialState.blocks
    },
    addBlock(state, payload: { name: string }) {
        if (state.blocks.length > 5) return

        const { name } = payload
        state.blocks.push({
            name: name.toLowerCase(),
            simpleText: '',
            structuredText: '',
            placeholder: '',
            images: [] as UploadResponse[],
        })
    },
    clearBlocks(state) {
        state.blocks = []
    },
    setBlock(state, payload) {
        state.blocks.push(payload)
    },
    updateBlockValue(state, payload: { index: number; value: string }) {
        const { index, value } = payload
        state.blocks[index].simpleText = value
    },
    updateBlockName(state, payload: { index: number; name: string }) {
        const { index, name } = payload
        state.blocks[index].name = name
    },
    addBlockImage(state, payload: { index: number; imageData: UploadResponse }) {
        const { index, imageData } = payload

        if (state.blocks[index].images.length > 2) return // max 2 images per block
        state.blocks[index].images.push(imageData)
    },
    addFindingImage(state, payload: UploadResponse) {
        state.finding.image = payload
    },
    removeFindingImage(state) {
        state.finding.image = {
            location: '',
            originalname: '',
        } as UploadResponse
    },
    updateBlockImage(
        state,
        payload: {
            index: number
            imageData: UploadResponse
            position: number
        }
    ) {
        const { index, imageData, position } = payload
        state.blocks[index].images[position] = imageData
    },
    removeBlockImage(state, payload: { index: number; position: number }) {
        const { index, position } = payload
        state.blocks[index].images.splice(position, 1)
    },
    removeBlock(state, payload: { index: number }) {
        const { index } = payload
        if (state.layout.includes(PDFType.MORRISON) && state.blocks.length > 4)
            state.blocks.splice(-2, 2)
        state.blocks.splice(index, 1)
    },
    updateLayout(state, payload: { layout: PDFLayout }) {
        const { layout } = payload
        state.layout = layout
    },
    // TODO: Delete and replace by resetCanvasModuleState
    resetState(state) {
        const newState = JSON.parse(JSON.stringify(initialState))

        Object.assign(state, newState)
    },
    resetCanvasState(state) {
        const newState = JSON.parse(JSON.stringify(initialState))

        Object.assign(state, newState)
    },
    updateDescription(state, payload: string) {
        state.description = payload
    },
    updateKeyword(state, payload) {
        state.keywords = payload
    },

    updateTopic(state, payload) {
        state.topics = payload
    },

    setPoster(state, payload: Poster) {
        state.poster = payload
    },
})

export const actions = actionTree(
    { state, getters, mutations },
    {
        resetCanvasState({ commit }) {
            commit('resetState')
        },
        async fetchPoster({ commit, state }, { id }: { id: number }) {
            const { getBase64ImageFromURL } = useCanvas()
            try {
                // eslint-disable-next-line no-unused-expressions
                const res = await this.$axios.get(`${APIRoutes.POSTERS}/${id}`)
                const poster: Poster = res.data

                commit('setPoster', poster) // Store original poster

                // Poster must be of type canvas
                if (poster.type.name !== PosterTypeEnum.CANVAS) return

                poster.visibility && commit('setVisibility', { visibility: poster.visibility })

                poster.title && commit('updateTitle', { value: poster.title })

                poster.layout && commit('updateLayout', { layout: poster.layout })

                poster.topics?.length &&
                    commit(
                        'updateTopic',
                        poster.topics.map((t) => t.name)
                    )

                poster.keywords?.length &&
                    commit(
                        'updateKeyword',
                        poster.keywords.map((k) => k.name)
                    )

                poster.description && commit('updateDescription', poster.description)

                if (poster.findings) {
                    if (poster.findings.image?.location) {
                        const url = await getBase64ImageFromURL(poster.findings.image.location)

                        commit('addFinding', {
                            ...poster.findings,
                            image: { ...poster.findings.image, url },
                        })
                        return
                    }

                    commit('addFinding', {
                        ...poster.findings,
                    })
                }

                if (poster.authors?.length) {
                    commit('clearAuthors')
                    poster.authors.map((author) => commit('setAuthor', author))
                }

                if (poster.posterContent?.length) {
                    commit('clearBlocks')

                    poster.posterContent.map((content, index) => {
                        if (content.images?.length) {
                            content.images.map(async (image, position) => {
                                const url = await getBase64ImageFromURL(image.location)

                                return commit('updateBlockImage', {
                                    index,
                                    imageData: { ...image, url },
                                    position,
                                })
                            })

                            return commit('setBlock', { ...content })
                        }

                        return commit('setBlock', { ...content, images: [] })
                    })
                }
            } catch (error) {}
        },

        async uploadFile(_, file: File): Promise<UploadResponse | undefined> {
            const formData = new FormData()
            formData.append('file', file)
            try {
                const request = await this.$axios.post(APIRoutes.UPLOADS, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                // Fetch and convert image into base64
                const url =
                    request?.data?.mimetype.includes('image') && request?.data?.location
                        ? await getBase64ImageFromURL(request.data.location)
                        : ''
                return { ...request.data, url }
            } catch (error) {
                this.$logger.error(error)
            }
        },

        async savePoster({ commit }, { poster, image, pdf, id = null }): Promise<any> {
            commit('setPosterUploadState', {
                loading: true,
                error: '',
                posterId: null,
            })
            const formData = new FormData()
            formData.append('data', JSON.stringify(poster))

            if (pdf?.size) formData.append('pdf', pdf, pdf.name)
            if (image) formData.append('image', image, image.name)

            try {
                let res
                if (id) {
                    res = await this.$axios.patch(APIRoutes.POSTERS + '/' + id, formData)
                } else {
                    res = await this.$axios.post(APIRoutes.POSTERS, formData)
                }
                commit('setPosterUploadState', {
                    posterId: res.data.id,
                    error: '',
                })

                // I want to avoid causing a problem when savePoster is used in the canvas
                // So I will just disable reset state for UPLOADED Type

                return res
            } catch (error) {
                commit('setPosterUploadState', {
                    error: 'There was an error while saving your Poster',
                })

                throw error
            } finally {
                commit('setPosterUploadState', {
                    loading: false,
                })
            }
        },
    }
)
