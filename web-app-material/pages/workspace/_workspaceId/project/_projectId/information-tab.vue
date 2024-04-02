<template>
    <VContainer class="tw-px-6 tw-ml-0 tw-max-w-6xl">
        <VRow class="tw-pt-5">
            <div class="col-12">
                <VBtn class="tw-ml-4" color="primary" small outlined @click="modalShow = true">
                    <VIcon left>mdi-pencil</VIcon>
                    Edit Content
                </VBtn>
                
                <VDialog
                    v-model="modalShow"
                    transition="scroll-x-reverse-transition"
                    max-width="50%"
                    persistent
                >
                    <VCard class="">
                        <VCardTitle
                            class="tw-flex tw-items-center tw-justify-between tw-px-12 tw-py-4"
                        >
                            <span> General Information </span>
                            <VCardActions class="">
                                <VBtn text @click="updateCancel"> Cancel</VBtn>
                                <VBtn color="primary" @click="updateDialogSave()"> Save</VBtn>
                            </VCardActions>
                        </VCardTitle>
                        <VCardText>
                            <VRow class="tw-px-6">
                                <VCol cols="12" class="tw-pb-0">
                                    <VTextarea
                                        v-model="summary"
                                        label="Summary"
                                        required
                                        outlined
                                        height="100"
                                    ></VTextarea>
                                </VCol>
                            </VRow>
                            <VRow class="tw-px-6">
                                <VCol class="tw-pb-0">
                                    <VeeCombobox
                                        v-model="topicsList"
                                        class="information-tab-modal-combobox"
                                        :label="'Topics'"
                                        :outlined="'outlined'"
                                        :multiple="'multiple'"
                                        :items="topicsList"
                                    >
                                    </VeeCombobox>
                                </VCol>
                            </VRow>
                            <VRow class="tw-px-6">
                                <VCol class="tw-pb-0">
                                    <VeeCombobox
                                        v-model="keywordsList"
                                        class="information-tab-modal-combobox"
                                        :label="'Keywords'"
                                        :outlined="'outlined'"
                                        :multiple="'multiple'"
                                        :items="keywordsList"
                                    >
                                    </VeeCombobox>
                                </VCol>
                            </VRow>
                            <VRow class="tw-pl-6">
                                <UploadFiles class="tw-pb-0" :modalshow="modalShow"></UploadFiles>
                            </VRow>
                            <VRow class="tw-pl-6">
                                <div
                                    v-for="(attachment, index) in attachments"
                                    :key="attachment.id + '-' + index"
                                    class="tw-block col-12 tw-py-0"
                                >
                                    <span class="tw-text-xs tw-pr-10 tw-py-0">
                                        {{ attachment.originalname }}
                                    </span>
                                    
                                    <VBtn
                                        icon
                                        class="tw-text-black tw-py-0"
                                        @click="addDeleteList(attachment.id)"
                                    >
                                        <FontAwesomeIcon :icon="icons.faTrashAlt" class="tw-mx-1" />
                                    </VBtn>
                                </div>
                            </VRow>
                        </VCardText>
                    </VCard>
                </VDialog>
            </div>

            <div class="col-8">
                <VCardTitle class="tw-text-black tw-text-base tw-pt-0">Summary</VCardTitle>
                <VCardText v-if="!informationTab.description">
                    <p>You have not entered a summary yet.</p>
                </VCardText>
                <VCardText v-else>
                    <p v-for="(paragraph, index) in descriptionToParagraphs()" :key="index">
                        {{ paragraph }}
                    </p>
                </VCardText>
            </div>
            <div class="col-4">
                <div>
                    <VCardTitle class="tw-text-black tw-text-base tw-pb-1">Topics</VCardTitle>
                    <VCardText class="tw-flex">
                        <div v-if="informationTab.topics && !informationTab.topics.length">
                            You have not entered topics yet.
                        </div>
                        <div
                            v-for="(topic, index) in informationTab.topics"
                            :key="topic.name + '-' + index"
                            class="
                                tw-mr-4
                                tw-my-1
                                tw-px-4
                                tw-py-0
                                tw-text-xs
                                tw-border
                                tw-border-solid
                                tw-rounded-full
                                tw-text-indigo-800
                                tw-border-indigo-800
                            "
                        >
                            {{ topic.name }}
                        </div>
                    </VCardText>
                </div>
                
                <div>
                    <VCardTitle class="tw-text-black tw-text-base tw-pb-1">Keywords</VCardTitle>
                    <VCardText class="tw-flex">
                        <div v-if="informationTab.keywords && !informationTab.keywords.length">
                            You have not entered keywords yet.
                        </div>
                        <div
                            v-for="(keyword, index) in informationTab.keywords"
                            :key="keyword.name + '-' + index"
                            class="
                                tw-mr-4
                                tw-my-1
                                tw-px-4
                                tw-py-0
                                tw-text-xs
                                tw-border
                                tw-border-solid
                                tw-rounded-full
                                tw-text-indigo-800
                                tw-border-indigo-800
                            "
                        >
                            {{ keyword.name }}
                        </div>
                    </VCardText>
                </div>
                <div>
                    <VCardTitle class="tw-text-black tw-text-base tw-pb-2"> Attachments</VCardTitle>
                    <VCardText>
                        <div
                            v-if="informationTab.attachments && !informationTab.attachments.length"
                        >
                            You have not entered attachments yet.
                        </div>
                        <div
                            v-for="(attachment, index) in informationTab.attachments"
                            :key="attachment.id + '-' + index"
                            class="tw-flex tw-justify-start tw-items-center tw-pb-1 tw-text-black"
                        >
                            <span class="tw-text-center tw-w-6 tw-mr-4">
                                <FontAwesomeIcon
                                    class="tw-text-lg"
                                    :icon="getIconByDocumentType(attachmentTypes[index])"
                                    width="20"
                                />
                            </span>
                            <a class="tw-text-xs" :href="attachment.location" target="_blank">{{
                                attachment.originalname
                            }}</a>
                        </div>
                    </VCardText>
                </div>
            </div>
        </VRow>
    </VContainer>
</template>

<script lang="ts">
import {
    faTrashAlt,
    faFile,
    faFilePdf,
    faFileWord,
    faFileExcel,
    faImage,
    faPresentation,
} from '@fortawesome/pro-regular-svg-icons'
import { defineComponent, ref, useFetch, useRoute } from '@nuxtjs/composition-api'
import useIcons from '~/composables/common/useIcons'
import useProject from '~/composables/project/useProject'
import UploadFiles from '~/components/project/UploadFiles.vue'
import VeeCombobox from '~/components/shared/inputs/VeeCombobox.vue'

export default defineComponent({
    name: 'InformationTab',
    components: {
        UploadFiles,
        VeeCombobox,
    },
    setup() {
        const { icons } = useIcons({
            faTrashAlt,
            faFile,
            faFilePdf,
            faFileWord,
            faFileExcel,
            faImage,
            faPresentation,
        })
        const route = useRoute()
        const workspaceId = parseInt(route.value.params.workspaceId)

        const modalShow = ref(false)

        const {
            summary,
            topicsList,
            keywordsList,
            attachments,
            attachmentTypes,
            informationTab,
            fetchProject,
            updateProject,
            removeSelectedFiles,
        } = useProject()

        useFetch(async () => {
            await fetchProject()
        })

        async function updateCancel() {
            modalShow.value = false
            await removeSelectedFiles()
            await fetchProject()
        }

        function updateDialogSave() {
            modalShow.value = false
            updateProject('', workspaceId)
        }
        function addDeleteList(id: number) {
            attachments.value = attachments.value.filter((item) => {
                return item.id !== id
            })
        }

        function getIconByDocumentType(type: string) {
            const icon =
                type === 'pdf'
                    ? faFilePdf
                    : type === 'jpg' || type === 'png'
                    ? faImage
                    : type === 'doc' || type === 'docx'
                    ? faFileWord
                    : type === 'ppt' || type === 'pptx'
                    ? faPresentation
                    : type === 'xls' || type === 'xlsx'
                    ? faFileExcel
                    : faFile
            return icon
        }

        function descriptionToParagraphs(): string[] {
            return informationTab.value.description.split(/\n/)
        }

        return {
            icons,
            informationTab,
            attachmentTypes,
            summary,
            modalShow,
            topicsList,
            keywordsList,
            attachments,
            updateCancel,
            updateDialogSave,
            addDeleteList,
            getIconByDocumentType,
            descriptionToParagraphs,
        }
    },
})
</script>
<style scoped></style>
