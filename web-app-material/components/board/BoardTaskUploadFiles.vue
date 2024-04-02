<template>
    <div class="tw-col-span-12">
        <VFileInput
            v-model="selectedFiles"
            :accept="supportedFileTypes"
            label="Attachments"
            placeholder="Select your files"
            color="tw-gray-200"
            dense
            counter
            multiple
            outlined
            show-size
            @change="$emit('selectedFiles', selectedFiles)"
        >
            <template #selection="{ index, text }">
                <VChip v-if="index < 2" color="tw-gray-200" label small>
                    {{ text }}
                </VChip>

                <span v-else-if="index === 2" class="text-overline tw-gray-200 mx-2">
                    +{{ selectedFiles.length - 2 }} File(s)
                </span>
            </template>
        </VFileInput>

        <ul class="attachments-list">
            <li
                v-for="attachment in attachmentsTemp"
                :key="attachment.id"
                class="tw-text-xs tw-pb-1"
            >
                <a :href="attachment.location" target="_blank" class="attachment-link">
                    {{ attachment.originalname }}
                </a>
                <a
                    class="attachment-delete grey--text text--darken-1"
                    @click="removeTaskUploads(attachment.id)"
                >
                    <FontAwesomeIcon :icon="icons.faTrashAlt"></FontAwesomeIcon>
                </a>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api'
import cloneDeep from 'lodash/cloneDeep'
import { faTrashAlt } from '@fortawesome/pro-regular-svg-icons'
import useIcons from '~/composables/common/useIcons'
import { ProjectTaskItemAttachment } from '~/types/projectTasks'

export default defineComponent({
    name: 'BoardTaskUploadFiles',
    props: {
        attachments: {
            type: Array as PropType<ProjectTaskItemAttachment[]>,
            required: true,
        },
        taskId: {
            type: Number as PropType<number>,
            required: true,
        },
    },
    setup(props, { emit }) {
        const { icons } = useIcons({ faTrashAlt })
        const { $accessor } = useContext()

        const supportedFileTypes = '.pdf, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .jpg, .png'

        const attachmentsTemp = ref(cloneDeep(props.attachments))
        const selectedFiles = ref([])

        /* -- Methods -- */
        // API calls
        async function removeTaskUploads(uploadId: number) {
            const taskId = props.taskId
            await $accessor.board.deleteTaskUploads({ taskId, uploadId })
            removeAttachment(uploadId)
        }

        // setters
        function removeAttachment(attachmentId) {
            attachmentsTemp.value = attachmentsTemp.value.filter((attachment) => {
                if (attachmentId !== attachment.id) {
                    return attachment
                }
                emit('attachmentRemoved', true)
                return null
            })
        }

        return {
            icons,
            supportedFileTypes,
            attachmentsTemp,
            selectedFiles,
            removeTaskUploads,
        }
    },
})
</script>

<style scoped>
.attachments-list {
    list-style: none;
    padding-left: 0;
}

.attachment-link {
    text-decoration: none;
}

.attachment-delete {
    @apply tw-text-sm;
    @apply tw-ml-2;
    display: inline-block;
    vertical-align: middle;
}
</style>
