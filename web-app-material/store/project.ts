import { actionTree, getterTree, mutationTree } from 'typed-vuex'
import { Project } from '~/types/entities/Project.entity'
import { InformationTab } from '~/types/entities/InformationTab.entity'
import { APIRoutesV2 } from '~/types/typing'
import { UploadResponse } from '~/types/entities/Upload.entity'

export const state = () => ({
    projectsList: [] as Project[],
    project: {} as Project,
    informationTab: {} as InformationTab,
    uploadedFiles: [] as UploadResponse[],
    createProjectModal: false,
    searchKey: '' as string,
})

export type ProjectState = ReturnType<typeof state>

export const getters = getterTree(state, {
    getProjectsList(state): Project[] {
        return state.projectsList
    },
    getProject: (state) => state.project,
    getInformationTab: (state) => state.informationTab,
    getUploadedFiles: (state) => state.uploadedFiles,
    getCreateProjectModal(state) {
        return state.createProjectModal
    },
    getSearchKey: (state) => state.searchKey,
})
export const mutations = mutationTree(state, {
    setProjectsList(state, payload: Project[]) {
        state.projectsList = payload
    },
    setProject(state, payload: Project) {
        state.project = payload
    },
    setInformationTab(state, payload: InformationTab) {
        state.informationTab = payload
    },
    setUploadedFiles(state, payload: UploadResponse) {
        state.uploadedFiles.push(payload)
    },
    emptyUploadedFiles(state) {
        state.uploadedFiles = [] as UploadResponse[]
    },
    setCreateProjectModal(state, payload: boolean) {
        state.createProjectModal = payload
    },
    setSearchKey(state, payload: string) {
        state.searchKey = payload
    },
})
export const actions = actionTree(
    {
        state,
        getters,
        mutations,
    },
    {
        setStateSearchKey({ commit }, { searchKey }: { searchKey: string }) {
            commit('setSearchKey', searchKey)
        },
        async fetchAllProject(
            { commit },
            { workspaceId, data }: { workspaceId: number; data: Object }
        ): Promise<any> {
            try {
                const result = await this.$axios.$get(
                    APIRoutesV2.WORKSPACES_ID_PROJECTS(workspaceId),
                    {
                        params: {
                            ...data,
                        },
                    }
                )
                commit('setProjectsList', result)
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async fetchProject(
            { commit },
            { workspaceId, projectId }: { workspaceId: number; projectId: number }
        ): Promise<any> {
            try {
                const result = await this.$axios.$get(
                    APIRoutesV2.WORKSPACES_ID_PROJECTS_ID(workspaceId, projectId)
                )
                commit('setProject', result)
                commit('setInformationTab', result.informationTabs[0])
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async createProject(
            _,
            { workspaceId, name, tenantId }: { workspaceId: number; name: string; tenantId: number }
        ): Promise<any> {
            try {
                const result = await this.$axios.$post(
                    APIRoutesV2.WORKSPACES_ID_PROJECTS(workspaceId),
                    {
                        name,
                        workspaceId,
                        tenantId,
                    }
                )
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async updateProject(
            { commit },
            {
                workspaceId,
                projectId,
                data,
            }: { workspaceId: number; projectId: number; data: object }
        ): Promise<any> {
            try {
                const result = await this.$axios.$patch(
                    APIRoutesV2.WORKSPACES_ID_PROJECTS_ID(workspaceId, projectId),
                    data
                )
                commit('setProject', result)
                commit('setInformationTab', result.informationTabs[0])
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async uploadFiles(
            { commit },
            {
                workspaceId,
                projectId,
                data,
            }: { workspaceId: number; projectId: number; data: object }
        ): Promise<any> {
            try {
                const result = await this.$axios.$patch(
                    APIRoutesV2.WORKSPACES_ID_PROJECTS_ID_UPLOADS(workspaceId, projectId),
                    data
                )
                commit('setUploadedFiles', result)
                return result
            } catch (error) {
                this.$logger.error(error)
            }
        },
        async removeUploadedFiles(
            { commit },
            {
                workspaceId,
                projectId,
                data,
            }: { workspaceId: number; projectId: number; data: any[] }
        ): Promise<any> {
            let _error = false
            for (let i = 0; i < data.length; i++) {
                await this.$axios
                    .$patch(
                        APIRoutesV2.WORKSPACES_ID_PROJECTS_ID_UPLOADS_ID(
                            workspaceId,
                            projectId,
                            data[i]
                        )
                    )
                    .catch((error) => {
                        this.$logger.error(error)
                        _error = true
                    })
            }
            if (!_error) commit('emptyUploadedFiles')
        },
        emptyUploadedFiles({ commit }) {
            commit('emptyUploadedFiles')
        },
    }
)
