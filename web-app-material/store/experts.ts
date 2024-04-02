import { actionTree, mutationTree, getterTree } from 'typed-vuex'
import { Author } from '~/types/entities/Author.entity'

export const state = () => ({
    user: {} as Author,
    simpleSearch: [''] as string[],
})

export type ExpertsState = ReturnType<typeof state>

export interface FetchPreviewAction {
    id: number
}

export const getters = getterTree(state, {
    getUser: (state) => state.user,
    getSimpleSearch: (state) => state.simpleSearch,
})

export const mutations = mutationTree(state, {
    setUser(state, payload: Author) {
        state.user = payload
    },

    setSimpleSearch(state, payload: string) {
        state.simpleSearch = [payload]
    },

    resetSearch(state): void {
        state.simpleSearch = ['']
    },
})

export const actions = actionTree({ state, getters, mutations }, {})
