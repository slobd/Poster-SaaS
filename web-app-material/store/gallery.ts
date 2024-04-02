import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { Poster } from '~/types/entities/Poster.entity'
import { APIRoutesV2 } from '~/types/typing'

export const state = () => ({
    poster: {} as Poster,
    showMode: false,
})

export const getters = getterTree(state, {
    getPoster: (state) => state.poster,
    getPosterAuthors: (state) => state.poster.authors,
    getPosterUser: (state) => state.poster.user,
    getShowMode: (state) => state.showMode,
})
export const mutations = mutationTree(state, {
    setPoster(state, payload: Poster) {
        state.poster = payload
    },
    setShowMode(state, payload: boolean) {
        state.showMode = payload
    },
})

interface FetchPosterPayload {
    workspaceId: number | string
    posterId: number | string
}

export const actions = actionTree(
    {
        state,
        getters,
        mutations,
    },
    {
        async fetchPoster({ commit }, payload: FetchPosterPayload) {
            try {
                const poster = await this.$axios.$get(
                    APIRoutesV2.WORKSPACES_ID_POSTERS_ID(payload.workspaceId, payload.posterId)
                )

                commit('setPoster', poster)
            } catch (error) {
                this.$logger.error(error)
            }
        },
    }
)
