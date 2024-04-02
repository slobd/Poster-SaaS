<template>
    <VRow class="col-12">
        <VCol class="col-12 tw-pb-0">
            <VFileInput
                v-model="selectedFiles"
                :accept="supportedFileTypes"
                color="tw-gray-200"
                counter
                label="Files input"
                multiple
                placeholder="Select your files"
                outlined
                :show-size="1000"
                @change="selectFiles"
                @click:clear="removeUploadedFiles"
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
        </VCol>
        <VCol class="col-12 tw-pt-0">
            <VAlert
                v-if="
                    currentUploadedFiles.length &&
                    currentUploadedFiles.length === selectedFiles.length &&
                    message === ''
                "
                dense
                border="left"
                type="success"
            >
                Upload successed!
            </VAlert>
            <VAlert
                v-if="
                    selectedFiles.length &&
                    currentUploadedFiles.length !== selectedFiles.length &&
                    message === ''
                "
                dense
                border="left"
                type="warning"
            >
                Uploading...
            </VAlert>
            <VAlert v-else-if="message" dense border="left" type="error">
                {{ message }}
            </VAlert>
        </VCol>
    </VRow>
</template>

<script lang="ts">
import {
    defineComponent,
    ref,
    computed,
    useFetch,
    watch,
    useContext,
} from '@nuxtjs/composition-api'
import useProject from '~/composables/project/useProject'

interface FileInfo {
    lastModified: number
    name: string
    size: number
    webkitRelativePath: string
}
export default defineComponent({
    name: 'UploadFiles',
    props: {
        modalshow: {
            type: Boolean,
        },
    },
    setup(props) {
        const { $accessor } = useContext()
        const { informationTab, fetchProject, uploadFiles, removeSelectedFiles } = useProject()
        useFetch(async () => {
            await fetchProject()
        })
        const currentUploadedFiles = computed(() => $accessor.project.getUploadedFiles)
        const currentInformationTab = computed(() => {
            return informationTab.value
        })
        const informationTabId = computed(() => {
            return informationTab.value?.id
        })
        const supportedFileTypes = '.pdf, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .jpg, .png'
        const selectedFiles = ref([] as FileInfo[])
        const message = ref('')
        const modalshow = computed(() => {
            return props.modalshow
        })

        watch(modalshow, async (_val: any, _prev: any) => {
            if (!props.modalshow) {
                selectedFiles.value = []
                message.value = ''
                await fetchProject()
            }
        })

        const selectFiles = async (files) => {
            await fetchProject()
            await removeSelectedFiles()
            selectedFiles.value = files
            message.value = ''
            // rules
            if (selectedFiles.value.length + currentInformationTab.value.attachments.length > 6)
                message.value = 'Up to 6 files can be added!'
            else {
                for (let i = 0; i < selectedFiles.value.length; i++) {
                    if (selectedFiles?.value[i].size > 10000000) {
                        message.value = 'The maximum size for each file is 10MB'
                        break
                    }
                    const _fileName = selectedFiles?.value[i].name.split('.')
                    let _fileType = ''
                    if (_fileName.length > 1) _fileType = _fileName[_fileName.length - 1]
                    if (!supportedFileTypes.includes(_fileType)) {
                        message.value =
                            'PDF, XLS, XLSX, DOC, DOCX, PPT, PPTX, JPG and PNG file formats can be uploaded.'
                        break
                    }
                }
            }
            // upload
            if (message.value === '') {
                for (let i = 0; i < selectedFiles.value.length; i++) {
                    upload(selectedFiles.value[i], informationTabId)
                }
            }
        }

        const upload = (file, informationTabId) => {
            uploadFiles(informationTabId, file)
        }

        const removeUploadedFiles = () => {
            removeSelectedFiles()
        }

        return {
            supportedFileTypes,
            currentUploadedFiles,
            selectedFiles,
            message,
            selectFiles,
            removeUploadedFiles,
            upload,
        }
    },
})
</script>
<style scoped>
.v-input__append-inner {
    display: none !important;
}
</style>
