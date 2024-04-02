import { actionTree, mutationTree, getterTree } from 'typed-vuex'
import { APIRoutesV2 } from '~/types/typing'
import { Workspace } from '~/types/entities/Workspace.entity'

interface WorkspaceCreateModal {
    newWorkspace: boolean
    status: boolean
}

export const state = () => ({
    workspaceList: [] as Workspace[],
    defaultWorkspace: {} as Workspace,
    workspaceId: null as number | null,
    createWorkspaceModal: {
        newWorkspace: false,
        status: false,
    } as WorkspaceCreateModal,
    deleteWorkspaceModal: false,
    searchKey: '' as string,
})

export type WorkspaceState = ReturnType<typeof state>

export const getters = getterTree(state, {
    getWorkspaceList(state): Workspace[] {
        return state.workspaceList
    },
    getDefaultWorkspace(state): Workspace {
        return state.defaultWorkspace
    },
    getWorkspaceId(state): number | null {
        return state.workspaceId
    },
    getCreateWorkspaceModal(state) {
        return state.createWorkspaceModal
    },
    getDeleteWorkspaceModal(state) {
        return state.deleteWorkspaceModal
    },
    getSearchKey: (state) => state.searchKey,
})

export const mutations = mutationTree(state, {
    setWorkspaceList(state, payload) {
        state.workspaceList = payload
    },
    setDefaultWorkspace(state, payload) {
        state.defaultWorkspace = payload
    },
    setWorkspaceId(state, payload) {
        state.workspaceId = payload
    },
    setCreateWorkspaceModal(state, payload) {
        state.createWorkspaceModal = payload
    },
    setDeleteWorkspaceModal(state, payload: boolean) {
        state.deleteWorkspaceModal = payload
    },
    setSearchKey(state, payload: string) {
        state.searchKey = payload
    },
})

export const actions = actionTree(
    { state, getters, mutations },
    {
        setStateSearchKey({ commit }, { searchKey }: { searchKey: string }) {
            commit('setSearchKey', searchKey)
        },
        async fetchAllWorkspace(
            { commit },
            { search, tenantId }: { search: string; tenantId: number }
        ): Promise<any> {
            try {
                const result = await this.$axios.$get(APIRoutesV2.WORKSPACES, {
                    params: {
                        tenantId,
                        search,
                    },
                })
                commit('setWorkspaceList', result)
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async fetchWorkspace({ commit }, { id }: { id: number }): Promise<any> {
            try {
                const result = await this.$axios.$get(APIRoutesV2.WORKSPACES_ID(id))
                commit('setWorkspaceId', id)
                commit('setDefaultWorkspace', result)
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async createWorkspace(
            _,
            { visibility, name, tenantId }: { visibility: string; name: string; tenantId: number }
        ): Promise<any> {
            try {
                const result = await this.$axios.$post(APIRoutesV2.WORKSPACES, {
                    name,
                    visibility,
                    tenantId,
                })
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async updateWorkspace(
            { commit },
            { id, data }: { id: number; data: object }
        ): Promise<any> {
            try {
                const result = await this.$axios.$patch(APIRoutesV2.WORKSPACES_ID(id), data)
                commit('setWorkspaceId', id)
                commit('setDefaultWorkspace', result)
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async selectWorkspace({ commit }, { workspaceId }: { workspaceId: number }): Promise<any> {
            try {
                const result = await this.$axios.$get(APIRoutesV2.WORKSPACES_ID(workspaceId))
                commit('setWorkspaceId', workspaceId)
                commit('setDefaultWorkspace', result)
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
    }
)
