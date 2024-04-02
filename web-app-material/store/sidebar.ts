import { GetterTree, MutationTree, ActionTree } from 'vuex/types'
import { RootState } from '.'
import { APIRoutes } from '~/types/typing'

interface Link {
    text: string
    to: string
}

interface LinkWithPermission extends Link {
    permission: {
        resource: string
        resourceId?: string
        action: string
    }
}

export const state = () => ({
    back: {
        to: '',
        text: '',
    },
    next: {
        to: '',
        text: '',
    },
    disableNext: false,
    disableBack: false,
    index: 0,
    submit: '', // Submit button text
    navItems: [] as Link[],
})
export type SidebarState = ReturnType<typeof state>

export const getters: GetterTree<SidebarState, RootState> = {
    getBack(state) {
        return state.back
    },
    getNext(state) {
        return state.next
    },
    getNextDisabled(state) {
        return state.disableNext
    },
    getBackDisabled(state) {
        return state.disableBack
    },
    getIndex(state) {
        return state.index
    },
    getNavItems(state) {
        return state.navItems
    },
}

export const actions: ActionTree<SidebarState, RootState> = {
    async updateNavItems(
        { commit, dispatch },
        payload: {
            links: LinkWithPermission[]
            currentRoute: string
        }
    ) {
        const { currentRoute, links } = payload
        const navItems = await Promise.all(
            links.map(async (link) => {
                if (link.permission) {
                    const allow = await this.$axios.$post(APIRoutes.IAM_CAN_USER, {
                        resource: link.permission.resource,
                        resourceId: link.permission.resourceId,
                        action: link.permission.action,
                    })

                    if (allow) {
                        return {
                            text: link.text,
                            to: link.to,
                        }
                    }
                } else {
                    return {
                        text: link.text,
                        to: link.to,
                    }
                }
            })
        )
        const definedItems = navItems.filter((item) => item !== undefined) as Link[]
        commit('setNavItems', definedItems)
        const currentIndex = definedItems.findIndex((item) => item.to === currentRoute)

        dispatch('updateIndex', {
            index: currentIndex === -1 ? 0 : currentIndex,
        })
    },
    backClick({ dispatch, state }) {
        dispatch('updateIndex', {
            index: state.index - 1,
        })
    },
    nextClick({ dispatch, state }) {
        dispatch('updateIndex', {
            index: state.index + 1,
        })
    },
    updateIndex({ state, commit }, payload) {
        const { index } = payload
        let back
        if (index && index !== 0) {
            back = state.navItems[index - 1]
        } else {
            back = { text: '', to: '' }
        }

        let next
        if (index !== state.navItems.length - 1) {
            next = state.navItems[index + 1]
        } else {
            next = { text: state.submit, to: '' }
        }

        commit('setIndex', index)
        commit('updateBack', back)
        commit('updateNext', next)
    },
}

export const mutations: MutationTree<SidebarState> = {
    updateBack(state, payload = { text: '', to: '' }) {
        state.back.to = payload.to
        state.back.text = payload.text
    },
    updateNext(state, payload) {
        state.next.to = payload.to
        state.next.text = payload.text
    },
    setBackDisabled(state, disabled: boolean = false) {
        state.disableBack = disabled
    },
    setNextDisabled(state, disabled: boolean = false) {
        state.disableNext = disabled
    },
    setIndex(state, payload: number) {
        state.index = payload
    },
    backClick(state) {
        state.index -= 1
    },
    nextClick(state) {
        state.index += 1
    },
    setNavItems(state, payload: Link[]) {
        state.navItems = payload
    },
    setSubmit(state, payload: string) {
        state.submit = payload
    },
}
