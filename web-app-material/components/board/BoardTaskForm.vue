<template>
    <VCard>
        <ValidationObserver v-slot="{ handleSubmit, invalid }" slim>
            <div class="task-form-header grey lighten-3">
                <div class="tw-text-xs tw-pl-10">
                    {{ currentWorkspace.name }}
                    <FontAwesomeIcon :icon="icons.faAngleRight" class="tw-mx-1.5"></FontAwesomeIcon>
                    {{ currentProject.name }}
                </div>
                <VSpacer></VSpacer>
                <VMenu offset-y left>
                    <template #activator="{ on }">
                        <VBtn
                            small
                            icon
                            class="tw-text-base grey--text text--darken-1 tw-mr-8"
                            v-on="on"
                        >
                            <FontAwesomeIcon :icon="icons.faEllipsisH"></FontAwesomeIcon>
                        </VBtn>
                    </template>
                    <VList dense>
                        <VListItem @click="$emit('deleteTask')">
                            <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>
                    </VList>
                </VMenu>
                <VCardActions class="task-form-actions tw-pl-5 tw-pr-8">
                    <VBtn class="tw-px-4" text small @click="cancelEdit()"> Cancel </VBtn>
                    <VBtn
                        class="tw-px-4"
                        color="primary"
                        small
                        depressed
                        :disabled="invalid"
                        @click="handleSubmit(submitTask)"
                    >
                        Save
                    </VBtn>
                </VCardActions>
            </div>
            <VDivider />

            <div class="task-form-grid tw-p-10">
                <div class="tw-col-span-2 task-inputs-grid">
                    <div class="tw-col-span-8">
                        <ValidationProvider
                            v-slot="vpCardTitle"
                            name="Card Title"
                            mode="eager"
                            rules="required"
                        >
                            <VTextField
                                v-model="currentTaskTemp.title"
                                label="Card Title*"
                                :error-messages="vpCardTitle.errors"
                                outlined
                                dense
                            ></VTextField>
                        </ValidationProvider>
                    </div>
                    <div class="tw-col-span-4">
                        <VSelect
                            v-model="currentTaskTemp.status.id"
                            :items="statusList"
                            item-text="label"
                            item-value="id"
                            label="Status"
                            class="tw-w-full"
                            outlined
                            dense
                        ></VSelect>
                    </div>
                    <div class="tw-col-span-12">
                        <VTextarea
                            v-model="currentTaskTemp.description"
                            label="Description"
                            outlined
                            dense
                            height="160"
                        ></VTextarea>
                    </div>
                    <BoardTaskUploadFiles
                        :attachments="currentTaskTemp.attachments"
                        :task-id="currentTaskTemp.id"
                        @selectedFiles="setAttachments($event)"
                        @attachmentRemoved="isAttachmentRemoved = true"
                    />
                </div>

                <div class="tw-col-span-1">
                    <h6 class="tw-text-xs tw-font-normal tw-pb-2">Due date</h6>
                    <div class="tw-flex tw-items-center tw-pb-7">
                        <VMenu
                            ref="dueDateRef"
                            v-model="isDueDateDatepickerVisible"
                            :close-on-content-click="false"
                            :return-value.sync="currentTaskTemp.dueDate"
                            transition="scale-transition"
                            offset-y
                            min-width="auto"
                        >
                            <template #activator="{ on }">
                                <VBtn
                                    small
                                    outlined
                                    icon
                                    color="grey lighten-2"
                                    class="tw-text-sm tw-mr-2"
                                    v-on="on"
                                >
                                    <FontAwesomeIcon
                                        :icon="icons.faCalendarCheck"
                                        class="grey--text text--lighten-1"
                                    ></FontAwesomeIcon>
                                </VBtn>
                            </template>
                            <VDatePicker v-model="currentTaskTemp.dueDate" no-title scrollable>
                                <VSpacer></VSpacer>
                                <VBtn
                                    text
                                    color="primary"
                                    @click="isDueDateDatepickerVisible = false"
                                >
                                    Cancel
                                </VBtn>
                                <VBtn
                                    text
                                    color="primary"
                                    @click="$refs.dueDateRef.save(currentTaskTemp.dueDate)"
                                >
                                    OK
                                </VBtn>
                            </VDatePicker>
                        </VMenu>
                        <span v-if="dueDateFormatted" class="tw-text-sm">
                            {{ dueDateFormatted }}
                        </span>
                        <VBtn
                            v-if="dueDateFormatted"
                            x-small
                            fab
                            depressed
                            width="12px"
                            height="12px"
                            color="grey"
                            class="tw-ml-2"
                            @click="resetDueDate()"
                        >
                            <FontAwesomeIcon
                                :icon="icons.faTimes"
                                class="white--text"
                                style="font-size: 6px"
                            ></FontAwesomeIcon>
                        </VBtn>
                    </div>

                    <h6 class="tw-text-xs tw-font-normal tw-pb-2">Assignee</h6>
                    <BoardTaskFormAssignees
                        :assignees="currentTaskTemp.assignees || []"
                        @assigneesUpdate="assigneesUpdate = $event"
                    />
                </div>
            </div>
        </ValidationObserver>
    </VCard>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, useContext } from '@nuxtjs/composition-api'
import cloneDeep from 'lodash/cloneDeep'
import { DateTime } from 'luxon'
import { faAngleRight, faCalendarCheck } from '@fortawesome/pro-regular-svg-icons'
import { faEllipsisH, faTimes } from '@fortawesome/pro-solid-svg-icons'
import useIcons from '~/composables/common/useIcons'
import { ProjectTaskItem } from '~/types/projectTasks'
import { UpdateTaskDto } from '~/sdk'

export default defineComponent({
    name: 'BoardTaskForm',
    props: {
        currentTask: {
            type: Object as PropType<ProjectTaskItem>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const { $accessor } = useContext()
        const { icons } = useIcons({ faAngleRight, faCalendarCheck, faEllipsisH, faTimes })

        const statusList = ref<{ label: string; id: number }[]>([])
        const currentTaskTemp = ref(cloneDeep(props.currentTask))
        const newAttachments = ref([])
        const assigneesUpdate = ref()

        // utilities
        const isDeleteModalVisible = ref(false)
        const isAttachmentRemoved = ref(false)
        const isDueDateDatepickerVisible = ref(false)

        /* -- Computed -- */
        const currentWorkspace = computed(() => $accessor.workspace.getDefaultWorkspace)
        const currentProject = computed(() => $accessor.project.getProject)
        const dueDateFormatted = computed(() => {
            if (currentTaskTemp.value.dueDate) {
                return DateTime.fromISO(currentTaskTemp.value.dueDate).toFormat('d LLL')
            } else {
                return ''
            }
        })

        /* -- Methods -- */
        async function submitTask() {
            await updateTask()
            for (const attachment of newAttachments.value) {
                await updateTaskUploads(attachment)
            }
            emit('refreshBoard')
            emit('closeModal')
        }

        // API actions
        async function updateTask() {
            const taskId = currentTaskTemp.value.id
            const taskData = {
                title: currentTaskTemp.value.title,
                description: currentTaskTemp.value.description,
                statusId: currentTaskTemp.value.status.id,
                assignees: assigneesUpdate.value,
            } as UpdateTaskDto
            if (currentTaskTemp.value.dueDate) {
                taskData.dueDate = new Date(currentTaskTemp.value.dueDate).toISOString()
            }
            await $accessor.board.updateTask({ taskId, taskData })
        }

        async function updateTaskUploads(attachment) {
            const taskId = currentTaskTemp.value.id
            const taskFile = new FormData()
            taskFile.append('attachment', attachment)
            await $accessor.board.updateTaskUploads({ taskId, taskFile })
        }

        // setters
        function setStatusList() {
            for (const status of $accessor.board.getBoard.statuses) {
                statusList.value.push({
                    label: status.name,
                    id: status.id,
                })
            }
        }
        function setAttachments(attachments) {
            newAttachments.value = attachments
        }
        function resetDueDate() {
            currentTaskTemp.value.dueDate = ''
        }

        function cancelEdit() {
            if (isAttachmentRemoved.value) emit('refreshBoard')
            emit('closeModal')
        }

        return {
            icons,
            statusList,
            currentTaskTemp,
            assigneesUpdate,
            isDeleteModalVisible,
            isAttachmentRemoved,
            isDueDateDatepickerVisible,
            currentWorkspace,
            currentProject,
            dueDateFormatted,
            submitTask,
            setStatusList,
            setAttachments,
            resetDueDate,
            cancelEdit,
        }
    },
    created() {
        this.setStatusList()
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
    border-left: 1px solid hsl(0, 0%, 88%);
}

.task-form-grid {
    @apply md:tw-grid;
    @apply md:tw-grid-cols-3;
    @apply tw-gap-x-16;
}

.task-inputs-grid {
    @apply tw-grid;
    @apply tw-grid-cols-12;
    @apply tw-gap-x-6;
}
</style>
