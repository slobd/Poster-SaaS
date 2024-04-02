<template>
    <div class="page-wrapper grey lighten-5">
        <WebMetadata />
        <header class="page-header tw-py-2 tw-px-10">
            <h1 class="tw-font-bold tw-text-lg">
                {{ projectTitle }}
            </h1>
            <VBtn icon color="tw-text-black" size="16" class="tw-mb-0.5" @click="toggleNameModal()">
                <FontAwesomeIcon
                    class=""
                    :icon="icons.faEllipsisH"
                    color="tw-text-black"
                    width="24"
                />
            </VBtn>

            <VDialog
                v-model="isNameModalVisible"
                transition="scroll-x-reverse-transition"
                max-width="50%"
            >
                <VCard class="">
                    <VCardTitle class="tw-flex tw-items-center tw-justify-between tw-py-6">
                        <span>Edit Project</span>
                    </VCardTitle>
                    <VCardText>
                        <VRow class="">
                            <VCol cols="12">
                                <VTextarea
                                    v-model="modelProjectName"
                                    required
                                    outlined
                                    label="Project Name"
                                    height="30"
                                ></VTextarea>
                            </VCol>
                        </VRow>
                        <VDivider />
                        <VCardActions class="tw-flex tw-justify-end">
                            <VBtn text @click="toggleNameModal()"> Cancel </VBtn>
                            <VBtn color="primary" @click="updateProjectName()"> Save </VBtn>
                        </VCardActions>
                    </VCardText>
                </VCard>
            </VDialog>
        </header>
        <VDivider />

        <div class="tw-px-6">
            <VTabs v-model="tab" background-color="transparent" color="basil" show-arrows>
                <VTab
                    class="tw-normal-case"
                    :to="`/workspace/${$route.params.workspaceId}/project/${$route.params.projectId}/information-tab`"
                >
                    General Information
                </VTab>
                <div v-for="board in project.boards" :key="board.id" class="board-tab-wrap">
                    <VTab
                        class="tw-normal-case tw-h-full"
                        :to="`/workspace/${$route.params.workspaceId}/project/${$route.params.projectId}/task-board/${board.id}`"
                    >
                        {{ board.title }}
                    </VTab>
                    <VMenu offset-y right>
                        <template #activator="{ on }">
                            <VBtn small icon class="board-tab-edit tw-text-sm" v-on="on">
                                <FontAwesomeIcon
                                    :icon="icons.faEllipsisV"
                                    class="grey--text text--lighten-1"
                                ></FontAwesomeIcon>
                            </VBtn>
                        </template>
                        <VList dense>
                            <VListItem v-if="$can('update', caslBoard)" @click="openTabForm(board)">
                                <VListItemTitle>Edit tab</VListItemTitle>
                            </VListItem>
                            <VListItem
                                v-if="$can('delete', caslBoard)"
                                @click="openTabDelete(board)"
                            >
                                <VListItemTitle>Delete tab</VListItemTitle>
                            </VListItem>
                        </VList>
                    </VMenu>
                </div>
                <VBtn
                    v-if="$can('create', caslBoard)"
                    class="tw-ml-4 tw-self-center"
                    color="primary"
                    small
                    outlined
                    @click="openTabForm()"
                >
                    <FontAwesomeIcon :icon="icons.faPlus" class="tw-mr-1.5" />
                    New Tab
                </VBtn>
            </VTabs>
        </div>
        <NuxtChild :key="$route.fullPath" />

        <VDialog v-model="isTabFormVisible" max-width="900px" persistent>
            <!-- transition component help to keep leave transition before child is destroyed -->
            <transition :duration="150">
                <BoardTabForm
                    v-if="isTabFormVisible"
                    :current-tab="tabToEdit"
                    @refreshProject="fetchProject"
                    @closeModal="isTabFormVisible = false"
                />
            </transition>
        </VDialog>

        <VDialog v-model="isTabDeleteVisible" max-width="500px" persistent>
            <!-- transition component help to keep leave transition before child is destroyed -->
            <transition :duration="150">
                <BoardTabDelete
                    v-if="isTabDeleteVisible"
                    :board-id="tabIdToDelete"
                    @refreshProject="fetchProject"
                    @closeModal="isTabDeleteVisible = false"
                />
            </transition>
        </VDialog>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, useFetch, useContext } from '@nuxtjs/composition-api'
import { subject } from '@casl/ability'
import { faEllipsisV, faEllipsisH, faPlus } from '@fortawesome/pro-solid-svg-icons'
import useIcons from '~/composables/common/useIcons'
import useProject from '~/composables/project/useProject'
import { Board } from '~/types/entities/Board.entity'

export default defineComponent({
    name: 'ProjectIndex',
    setup() {
        const { $accessor } = useContext()
        const { icons } = useIcons({
            faEllipsisV,
            faEllipsisH,
            faPlus,
        })
        const { project, fetchProject, updateProject } = useProject()
        useFetch(fetchProject)

        const tab = null

        const modelProjectName = ref()
        const tabToEdit = ref<Board>({} as Board)
        const tabIdToDelete = ref<number>()
        const isNameModalVisible = ref(false)
        const isTabFormVisible = ref(false)
        const isTabDeleteVisible = ref(false)

        /* -- Computed -- */
        const projectName = computed(() => {
            modelProjectName.value = project ? project.value.name : ''
            return project ? project.value.name : ''
        })
        const projectTitle = computed(() => {
            return projectName.value && projectName.value.length >= 40
                ? projectName.value.slice(0, 40) + '...'
                : projectName.value
        })

        const caslBoard = computed(() =>
            subject('Board', {
                project: {
                    visibility: project.value.visibility,
                    workspaceId: project.value.workspaceId,
                    workspace: {
                        tenantId: $accessor.tenant.getTenantId,
                        id: project.value.workspaceId,
                    },
                },
            })
        )

        /* -- Methods -- */
        // API actions
        function updateProjectName() {
            isNameModalVisible.value = false
            updateProject(modelProjectName.value, null)
        }

        function openTabForm(tabItem?: Board) {
            tabToEdit.value = tabItem || ({} as Board)
            isTabFormVisible.value = true
        }

        function openTabDelete(tabItem: Board) {
            tabIdToDelete.value = tabItem.id
            isTabDeleteVisible.value = true
        }

        // utilities
        function toggleNameModal() {
            isNameModalVisible.value = !isNameModalVisible.value
        }

        return {
            icons,
            project,
            tab,
            modelProjectName,
            tabToEdit,
            tabIdToDelete,
            isNameModalVisible,
            isTabFormVisible,
            isTabDeleteVisible,
            projectName,
            projectTitle,
            caslBoard,
            fetchProject,
            updateProjectName,
            openTabForm,
            openTabDelete,
            toggleNameModal,
        }
    },
})
</script>

<style scoped>
.board-tab-wrap {
    display: flex;
}

.board-tab-wrap:hover .board-tab-edit {
    opacity: 1;
}
.board-tab-edit {
    align-self: center;
    opacity: 0;
}
</style>
