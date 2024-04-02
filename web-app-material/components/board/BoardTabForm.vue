<template>
    <VCard>
        <ValidationObserver v-slot="{ handleSubmit }" slim>
            <div class="task-form-header grey lighten-3">
                <div class="tw-text-xs tw-pl-10">
                    {{ currentWorkspace.name }}
                    <FontAwesomeIcon :icon="icons.faAngleRight" class="tw-mx-1.5"></FontAwesomeIcon>
                    {{ currentProject.name }}
                </div>
                <VSpacer></VSpacer>
                <VCardActions class="task-form-actions tw-pl-5 tw-pr-8">
                    <VBtn class="tw-px-4" text small @click="$emit('closeModal')"> Cancel </VBtn>
                    <VBtn
                        v-if="isNewTab"
                        class="tw-px-4"
                        color="primary"
                        small
                        depressed
                        @click="handleSubmit(createBoard)"
                    >
                        Add Tab
                    </VBtn>
                    <VBtn
                        v-else
                        class="tw-px-4"
                        color="primary"
                        small
                        depressed
                        @click="handleSubmit(updateBoard)"
                    >
                        Save
                    </VBtn>
                </VCardActions>
            </div>
            <VDivider />

            <div class="tab-form-grid tw-p-9">
                <div class="tw-col-span-2">
                    <h2 class="tw-text-lg tw-pb-5">
                        <span v-if="isNewTab">Add a tab</span>
                        <span v-else>Edit tab</span>
                    </h2>
                </div>
                <div class="tw-col-span-1">
                    <ValidationProvider
                        v-slot="vpTabTitle"
                        name="Tab Title"
                        mode="eager"
                        rules="required"
                    >
                        <VTextField
                            v-model="currentTabTemp.title"
                            label="Tab Title*"
                            :error-messages="vpTabTitle.errors"
                            outlined
                            dense
                        ></VTextField>
                    </ValidationProvider>
                </div>
                <div class="tw-col-span-1">
                    <ValidationProvider
                        v-slot="vpTabType"
                        name="Status"
                        mode="eager"
                        rules="required"
                    >
                        <VSelect
                            v-model="selectedTabTypeId"
                            :items="tabTypeList"
                            item-text="label"
                            item-value="id"
                            label="Tab Type*"
                            class="tw-w-full"
                            outlined
                            dense
                            :error-messages="vpTabType.errors"
                            :disabled="!isNewTab"
                        ></VSelect>
                    </ValidationProvider>
                </div>

                <div v-if="isNewTab" class="tw-col-span-2 template-form-grid grey lighten-3">
                    <div class="tw-col-span-12">
                        <h6 class="tw-text-xs tw-font-normal tw-pb-5">Select template</h6>
                    </div>
                    <div class="tw-col-span-5">
                        <ValidationProvider
                            v-slot="vpBoardTemplates"
                            name="Template"
                            mode="eager"
                            rules="required"
                        >
                            <VSelect
                                v-model="selectedTemplateId"
                                :items="boardTemplates"
                                label="Template"
                                item-text="name"
                                item-value="id"
                                class="tw-w-full"
                                background-color="white"
                                outlined
                                dense
                                :error-messages="vpBoardTemplates.errors"
                            ></VSelect>
                        </ValidationProvider>
                    </div>
                    <div v-if="selectedTemplateId" class="tw-col-span-7">
                        <p class="tw-text-xs tw-pb-5">
                            {{ selectedTemplate.description }}
                        </p>
                        <h5 class="tw-text-sm tw-pb-2">Statuses</h5>
                        <ul class="tag-list">
                            <li
                                v-for="(status, index) in selectedTemplate.statuses"
                                :key="index"
                                class="tag-item"
                            >
                                {{ status }}
                            </li>
                        </ul>
                        <h5 class="tw-text-sm tw-pb-2">Attributes</h5>
                        <ul class="tag-list">
                            <li class="tag-item">Description</li>
                            <li class="tag-item">Due date</li>
                            <li class="tag-item">Assignees</li>
                            <li class="tag-item">Attachments</li>
                        </ul>
                    </div>
                    <div class="tw-col-span-12 contact-note grey--text">
                        Interested in custom templates?
                        <a :href="contactSupport" target="_blank" class="grey--text">Contact us</a>
                    </div>
                </div>
            </div>
        </ValidationObserver>
    </VCard>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, useContext } from '@nuxtjs/composition-api'
import cloneDeep from 'lodash/cloneDeep'
import { faAngleRight } from '@fortawesome/pro-regular-svg-icons'
import useIcons from '~/composables/common/useIcons'
import taskBoardTemplates from '~/composables/project/taskBoardTemplates.json'
import { Board } from '~/types/entities/Board.entity'

export default defineComponent({
    name: 'BoardTabForm',
    props: {
        currentTab: {
            type: Object as PropType<Board>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const { $accessor } = useContext()
        const { icons } = useIcons({ faAngleRight })

        const isNewTab = !props.currentTab.id
        const tabTypeList = [{ id: 1, label: 'Task board' }]
        const boardTemplates = taskBoardTemplates
        const contactSupport = process.env.contactSupport

        const currentTabTemp = ref()
        const selectedTabTypeId = ref()
        const selectedTemplateId = ref('')

        /* -- Computed -- */
        const currentWorkspace = computed(() => $accessor.workspace.getDefaultWorkspace)
        const currentProject = computed(() => $accessor.project.getProject)
        const selectedTemplate = computed(() => {
            return boardTemplates.filter((template) => {
                return template.id === selectedTemplateId.value
            })[0]
        })

        /* -- Methods -- */
        // API actions
        async function createBoard() {
            const boardData = {
                projectId: currentProject.value.id,
                title: currentTabTemp.value.title,
                project: {
                    visibility: currentProject.value.visibility,
                    workspaceId: currentProject.value.workspaceId,
                },
                statuses: setCreationBoardStatuses(),
                cards: setCreationBoardCards(),
            }
            await $accessor.board.createBoard(boardData)
            emit('refreshProject')
            emit('closeModal')
        }

        async function updateBoard() {
            const boardData = {
                title: currentTabTemp.value.title,
            }
            const boardId = currentTabTemp.value.id
            await $accessor.board.updateBoard({ boardId, boardData })
            emit('refreshProject')
            emit('closeModal')
        }

        // setters
        function setCurrentTab() {
            if (isNewTab) {
                currentTabTemp.value = {
                    title: '',
                    type: {},
                }
                selectedTabTypeId.value = 1
                selectedTemplateId.value = '1'
            } else {
                currentTabTemp.value = cloneDeep(props.currentTab)
                selectedTabTypeId.value = 1
            }
        }
        function setCreationBoardStatuses() {
            return selectedTemplate.value.statuses.map((status) => {
                return { name: status }
            })
        }

        function setCreationBoardCards() {
            return selectedTemplate.value.cards.map((card) => {
                return {
                    status: card.status,
                    title: card.title,
                    description: card.description,
                }
            })
        }

        return {
            icons,
            isNewTab,
            tabTypeList,
            boardTemplates,
            contactSupport,
            currentTabTemp,
            selectedTabTypeId,
            selectedTemplateId,
            currentWorkspace,
            currentProject,
            selectedTemplate,
            createBoard,
            updateBoard,
            setCurrentTab,
        }
    },
    created() {
        this.setCurrentTab()
    },
})
</script>

<style scoped>
.task-form-header {
    display: flex;
    align-items: center;
    min-height: 56px;
}

.task-form-actions {
    min-height: 56px;
}

.tab-form-grid {
    @apply sm:tw-grid;
    @apply sm:tw-grid-cols-2;
    @apply tw-gap-x-10;
}

.template-form-grid {
    @apply sm:tw-grid;
    @apply sm:tw-grid-cols-12;
    @apply tw-gap-x-10;
    @apply tw-px-6 tw-py-4;
    @apply tw-mt-3;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding-left: 0;
    @apply tw-pb-5;
}

.tag-item {
    @apply tw-mr-2
    tw-mb-2
    tw-px-3
    tw-py-1
    tw-text-xs
    tw-border
    tw-border-solid
    tw-rounded-full
    tw-text-indigo-800
    tw-border-indigo-800;
}

.contact-note {
    font-size: 10px;
}
</style>
