<template>
    <VCard :id="currentTask.id" class="task-card tw-mb-4 tw-rounded-md tw-p-3.5">
        <div class="tw-flex tw-pb-1">
            <div class="task-name tw-font-medium tw-pr-2" @click.stop="taskFormVisibilityToggle()">
                {{ currentTask.title }}
                <FontAwesomeIcon
                    v-if="currentTask.attachments.length"
                    :icon="icons.faPaperclip"
                    class="task-name-attachment grey--text text--lighten-1"
                ></FontAwesomeIcon>
            </div>
            <VMenu offset-y left>
                <template #activator="{ on }">
                    <VBtn small icon class="tw-text-sm tw--mr-2.5 tw--mt-1.5" v-on="on">
                        <FontAwesomeIcon
                            :icon="icons.faEllipsisV"
                            class="grey--text text--lighten-1"
                        ></FontAwesomeIcon>
                    </VBtn>
                </template>
                <VList dense>
                    <VListItem @click="isDeleteModalVisible = true">
                        <VListItemTitle>Delete Task</VListItemTitle>
                    </VListItem>
                </VList>
            </VMenu>
        </div>

        <div class="task-people-date-wrap">
            <VTooltip
                v-for="(assignee, index) in currentTask.assignees.slice(0, 3)"
                :key="index"
                top
            >
                <template #activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on">
                        <ProfileImage
                            :user="assignee"
                            :size="24"
                            class="tw-text-xs tw-mr-1 tw-cursor-default"
                        />
                    </span>
                </template>
                <span>{{ assignee.firstName }} {{ assignee.lastName }}</span>
            </VTooltip>
            <div
                v-if="remainingAssignees > 0"
                class="grey--text text--lighten-1 tw-text-xs tw-ml-1"
            >
                +{{ remainingAssignees }}
            </div>
            <div v-if="currentTask.dueDate" :class="{ 'tw-ml-3': currentTask.assignees.length }">
                <FontAwesomeIcon
                    :icon="icons.faCalendarCheck"
                    class="tw-text-sm grey--text text--lighten-1"
                ></FontAwesomeIcon>
                <span class="task-date grey--text">{{ dueDateFormatted }}</span>
            </div>
        </div>

        <div class="task-description">{{ currentTask.description }}</div>

        <VDialog v-model="isTaskFormVisible" max-width="900px" persistent>
            <!-- transition component help to keep leave transition before child is destroyed -->
            <transition :duration="150">
                <BoardTaskForm
                    v-if="isTaskFormVisible"
                    :current-task="currentTask"
                    @refreshBoard="$emit('refreshBoard')"
                    @closeModal="taskFormVisibilityToggle()"
                    @deleteTask="isDeleteModalVisible = true"
                />
            </transition>
        </VDialog>

        <VDialog v-model="isDeleteModalVisible" max-width="300px" persistent>
            <VCard>
                <VCardText class="tw-text-base tw-pt-4">
                    Are you sure you want to delete this task?
                </VCardText>
                <VDivider></VDivider>
                <VCardActions class="tw-justify-end">
                    <VBtn text small @click="isDeleteModalVisible = false"> Cancel </VBtn>
                    <VBtn color="error" small depressed @click="removeTask()"> Delete </VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </VCard>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, useContext, computed } from '@nuxtjs/composition-api'
import { DateTime } from 'luxon'
import { faPaperclip, faCalendarCheck } from '@fortawesome/pro-regular-svg-icons'
import { faEllipsisV } from '@fortawesome/pro-solid-svg-icons'
import useIcons from '~/composables/common/useIcons'
import { ProjectTaskItem } from '~/types/projectTasks'

export default defineComponent({
    name: 'BoardTaskCard',
    props: {
        currentTask: {
            type: Object as PropType<ProjectTaskItem>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const { icons } = useIcons({ faEllipsisV, faPaperclip, faCalendarCheck })
        const { $accessor } = useContext()

        const isTaskFormVisible = ref(false)
        const isDeleteModalVisible = ref(false)

        const remainingAssignees = computed(() => {
            return props.currentTask.assignees.length - 3
        })
        const dueDateFormatted = computed(() => {
            if (props.currentTask.dueDate) {
                return DateTime.fromISO(props.currentTask.dueDate).toFormat('d LLL')
            } else {
                return ''
            }
        })

        /* -- Methods -- */
        // API actions
        async function removeTask() {
            const taskId = props.currentTask.id
            await $accessor.board.deleteTask(taskId)
            emit('refreshBoard')
            isDeleteModalVisible.value = false
        }

        // utilities
        function taskFormVisibilityToggle() {
            isTaskFormVisible.value = !isTaskFormVisible.value
        }

        return {
            icons,
            isTaskFormVisible,
            isDeleteModalVisible,
            remainingAssignees,
            dueDateFormatted,
            removeTask,
            taskFormVisibilityToggle,
        }
    },
})
</script>

<style scoped>
.task-card {
    cursor: grab;
}
.task-card.sortable-ghost {
    background-color: #c5cae9;
}

.task-name {
    flex: 1;
    max-width: calc(100% - 18px);
    font-size: 14px;
    line-height: 1.25em;
    cursor: pointer;
}

.task-name-attachment {
    @apply tw-ml-1;
    font-size: 13px;
}

.task-people-date-wrap {
    display: flex;
    align-items: center;
    @apply tw-pb-3;
}

.task-date {
    display: inline-block;
    font-size: 11px;
    vertical-align: middle;
    @apply tw-ml-1;
}

.task-description {
    font-size: 10px;
    line-height: 1.25em;
}
</style>
