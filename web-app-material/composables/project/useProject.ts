import { ref, useContext, useRoute } from '@nuxtjs/composition-api'
import { Project } from '~/types/entities/Project.entity'
import { InformationTab } from '~/types/entities/InformationTab.entity'
import { UploadResponse } from '~/types/entities/Upload.entity'
import { APIRoutesV2 } from '~/types/typing'

export default function useProject() {
    const { $accessor, $axios } = useContext()
    const route = useRoute()

    const project = ref<Project>({} as Project)
    const informationTab = ref<InformationTab>({} as InformationTab)
    const summary = ref()
    const topicsList = ref()
    const keywordsList = ref()
    const attachments = ref<UploadResponse[]>([] as UploadResponse[])
    const attachmentTypes = ref()
    const uploadedFiles = ref<UploadResponse[]>([] as UploadResponse[])

    async function fetchProject(): Promise<void> {
        try {
            await $accessor.project.fetchProject({
                workspaceId: parseInt(route.value.params.workspaceId),
                projectId: parseInt(route.value.params.projectId),
            })
            _getStateVariables()
        } catch (error) {
            _resetdefaultStateVariables()
        }
    }

    async function uploadFiles(informationTabId, file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('data', JSON.stringify({ informationTabId }))
        try {
            await $accessor.project.uploadFiles({
                workspaceId: parseInt(route.value.params.workspaceId),
                projectId: parseInt(route.value.params.projectId),
                data: formData,
            })
            _getStateVariables()
            uploadedFiles.value = $accessor.project.getUploadedFiles
        } catch (error) {}
    }

    async function updateProject(_name: string, _workspaceId: any): Promise<void> {
        uploadedFiles.value = $accessor.project.getUploadedFiles
        const _tempInformationTab: any = {
            id: informationTab.value.id,
            description: summary.value,
            topics: topicsList.value
                ? topicsList.value.map((item) => {
                      return {
                          name: item.text,
                          workspaceId: _workspaceId,
                      }
                  })
                : [],
            keywords: keywordsList.value
                ? keywordsList.value.map((item) => {
                      return {
                          name: item.text,
                          workspaceId: _workspaceId,
                      }
                  })
                : [],
            attachments: [
                ...(attachments.value
                    ? attachments.value.map((item) => {
                          return { id: item.id }
                      })
                    : []),
                ...(uploadedFiles.value
                    ? uploadedFiles.value.map((item) => {
                          return {
                              id: item.id,
                          }
                      })
                    : []),
            ],
        }
        const data = {
            name: _name || project.value?.name,
            informationTab: _tempInformationTab || informationTab,
            tenantId: $accessor.tenant.getTenantId,
        }
        try {
            await $accessor.project.updateProject({
                workspaceId: parseInt(route.value.params.workspaceId),
                projectId: parseInt(route.value.params.projectId),
                data,
            })
            await $accessor.project.emptyUploadedFiles()
            await fetchProject()
        } catch (error) {
            _resetdefaultStateVariables()
        }
    }

    async function deleteProject(projectId: number): Promise<void> {
        try {
            await $axios.$delete(
                APIRoutesV2.WORKSPACES_ID_PROJECTS_ID(
                    parseInt(route.value.params.workspaceId),
                    projectId
                )
            )
            await $accessor.project.fetchAllProject({
                data: {
                    name: $accessor.project.getSearchKey,
                },
                workspaceId: parseInt(route.value.params.workspaceId),
            })
        } catch (error) {
            _resetdefaultStateVariables()
        }
    }

    async function removeSelectedFiles() {
        const _uploadedFiles = $accessor.project.getUploadedFiles.map((item) => {
            return item.id
        })
        try {
            await $accessor.project.removeUploadedFiles({
                workspaceId: parseInt(route.value.params.workspaceId),
                projectId: parseInt(route.value.params.projectId),
                data: _uploadedFiles,
            })
            _getStateVariables()
        } catch (error) {
            _getStateVariables()
        }
    }

    function _getStateVariables() {
        project.value = $accessor.project.getProject
        informationTab.value = $accessor.project.getInformationTab
        
        summary.value =
            $accessor.project.getInformationTab && $accessor.project.getInformationTab.description
                ? $accessor.project.getInformationTab.description
                : ''
        topicsList.value = $accessor.project.getInformationTab.topics
            ? $accessor.project.getInformationTab.topics.map((item) => {
                  return { text: item.name }
              })
            : []
        keywordsList.value = $accessor.project.getInformationTab.keywords
            ? $accessor.project.getInformationTab.keywords.map((item) => {
                  return { text: item.name }
              })
            : []
        attachments.value = $accessor.project.getInformationTab.attachments
        attachmentTypes.value = $accessor.project.getInformationTab.attachments
            ? $accessor.project.getInformationTab.attachments.map((item) => {
                  const temp = item.originalname?.split('.')
                  return temp?.length > 1 ? temp[temp.length - 1] : ''
              })
            : []
    }
    
    function _resetdefaultStateVariables() {
        project.value = {} as Project
        informationTab.value = {} as InformationTab
        summary.value = ''
        topicsList.value = []
        keywordsList.value = []
        attachments.value = []
        attachmentTypes.value = []
    }

    return {
        project,
        informationTab,
        summary,
        topicsList,
        keywordsList,
        attachments,
        attachmentTypes,
        fetchProject,
        updateProject,
        deleteProject,
        uploadFiles,
        removeSelectedFiles,
    }
}
