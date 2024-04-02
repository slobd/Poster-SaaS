import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import cloneDeep from 'lodash/cloneDeep'

interface UserManagementUser {
    email: string
    role: string
}

const initialState = {
    /**
     * TODO: Refactor, bad naming convention this could be the list of users of the tenant as well, but it's the list of the users to be invite
     */
    usersInviteList: [
        {
            email: '',
            role: '',
        },
    ] as UserManagementUser[],
}

export const state = () => initialState

export const mutations = mutationTree(state, {
    addUser(state) {
        state.usersInviteList.push({
            email: '',
            role: '',
        } as { email: string; role: string })
    },
    removeUser(state, payload: { index: number }) {
        const { index } = payload
        state.usersInviteList.splice(index, 1)
    },
    updateUser(
        state,
        payload: {
            index: number
            key: 'email' | 'role'
            value: string
        }
    ) {
        const { index, key, value } = payload
        state.usersInviteList[index][key] = value
    },
    resetState(state) {
        const newState = cloneDeep(initialState)
        Object.assign(state, newState)
    },
})

export const getters = getterTree(state, {
    getUsersInviteList(state) {
        return state.usersInviteList
    },
})

export const actions = actionTree({ state, mutations, getters }, {})
