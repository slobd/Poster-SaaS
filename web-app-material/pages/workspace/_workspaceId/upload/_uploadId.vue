<template>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit, errors }">
        <VContainer fluid>
            <UploadSuccessDialog
                v-model="uploadState.succesful"
                :poster-id="poster.id"
                message="Poster uploaded successfully"
            />
            <!-- Header -->
            <div class="tw-flex tw-items-center tw-my-4 tw-ml-4">
                <h3 class="grey--text text--darken-3 tw-font-medium tw-text-xl tw-leading-6">
                    <span class="grey--text text--lighten-1 tw-mr-3"
                        ><FontAwesomeIcon :icon="icons.faFileAlt"
                    /></span>
                    Document Upload
                </h3>

                <VSpacer />
                <VBtn
                    to="/gallery"
                    text
                    class="grey--text text--darken-3 tw-text-base tw-normal-case tw-no-underline"
                >
                    <FontAwesomeIcon class="tw-mr-1" :icon="icons.faArrowLeft" />
                    Gallery
                </VBtn>
            </div>
            <!-- Body -->
            <VStepper v-model="step" non-linear class="tw-bg-transparent" elevation="0">
                <VStepperHeader class="tw-bg-white tw-mx-6 tw-rounded-xl" elevation="2">
                    <VStepperStep
                        :rules="[() => hasErrorInStep(errors, ['title', 'pdf', 'image'])]"
                        editable
                        :complete="step > 1"
                        :step="1"
                        :class="step === 1 ? 'tw-bg-gray-200' : ''"
                        class="tw-rounded-l-xl"
                        @click="updateStep(1)"
                    >
                        File upload *
                    </VStepperStep>

                    <VDivider></VDivider>

                    <VStepperStep
                        editable
                        :complete="step > 2"
                        :step="2"
                        :class="step === 2 ? 'tw-bg-gray-200' : ''"
                        @click="updateStep(2)"
                    >
                        Authors
                    </VStepperStep>
                    <VDivider></VDivider>
                    <VStepperStep
                        editable
                        :step="3"
                        :class="step === 2 ? 'tw-bg-gray-200' : ''"
                        class="tw-rounded-r-xl"
                        @click="updateStep(3)"
                    >
                        Additional Information
                    </VStepperStep>
                </VStepperHeader>

                <VStepperItems :elevation="2">
                    <!-- Step 1 -->
                    <VStepperContent step="1">
                        <VRow>
                            <VCol class="py-4" md="6">
                                <VeeTextField
                                    v-model="poster.title"
                                    rules="required"
                                    label="Title"
                                    vid="title"
                                    outlined
                                />

                                <VeeFileInput
                                    :value="assets.pdf"
                                    accept="application/pdf"
                                    name="Document"
                                    vid="pdf"
                                    rules="required|size:20480|mimeType:application/pdf"
                                    label="Upload your document"
                                    hint="Max size: 20 Mb. Allowed formats: PDF"
                                    persistent-hint
                                    outlined
                                    clearable
                                    @change="handlePdfInput"
                                />

                                <VeeFileInput
                                    :value="assets.image"
                                    accept="image/jpeg, image/png"
                                    name="Image"
                                    vid="image"
                                    rules="size:2000|mimeType:image/jpeg,image/png"
                                    label="Add custom cover image"
                                    hint="Max size: 2 Mb. Allowed formats: PNG, JPEG"
                                    persistent-hint
                                    outlined
                                    clearable
                                    @change="handleImageInput"
                                />
                                <VBtn class="tw-mt-7" color="primary" @click="updateStep(step + 1)">
                                    Continue
                                </VBtn>
                            </VCol>
                            <VCol
                                id="pdf-upload"
                                class="
                                    tw-flex tw-flex-col tw-justify-items-center tw-items-center
                                    fixed
                                    py-4
                                "
                                md="6"
                            >
                                <h3 class="text-h6">Cover image preview</h3>
                                <VImg
                                    v-if="thumbnail"
                                    contain
                                    max-height="400"
                                    max-width="500"
                                    :src="thumbnail"
                                />
                                <VSkeletonLoader
                                    v-else
                                    width="400"
                                    height="400"
                                    type="image"
                                    :boilerplate="!isGeneratingImage"
                                />
                                <!--Renders the PDF in a canvas to generate the Image File-->
                                <VuePdf
                                    v-if="pdfPreviewURL"
                                    :page="1"
                                    :src="pdfPreviewURL"
                                    style="width: 400px; height: 400px; left: -400px; top: -400px"
                                    class="tw-fixed"
                                />
                                <!--<VImg-->
                                <!--    v-if="assets.image && assets.image.size > 0"-->
                                <!--    :src="assets.image"-->
                                <!--/>-->
                            </VCol>
                        </VRow>
                    </VStepperContent>
                    <!--Step 2: Coauthors-->
                    <VStepperContent step="2">
                        <VRow>
                            <VCol cols="12" class="tw-flex">
                                <UploadUserSearch
                                    :authors="poster.authors"
                                    @input="poster.authors.push($event)"
                                />
                            </VCol>

                            <VCol cols="12">
                                <VCard class="tw-mx-2" elevation="4">
                                    <UploadAuthorsTable
                                        :authors="poster.authors"
                                        @remove-user="removeUser($event)"
                                    />
                                </VCard>
                            </VCol>
                            <VCol cols="12">
                                <VBtn
                                    class="tw-mt-8 tw-ml-1"
                                    color="primary"
                                    @click="updateStep(step + 1)"
                                >
                                    Continue
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VStepperContent>

                    <VStepperContent step="3">
                        <VRow class="tw-flex tw-justify-center tw-items-center">
                            <VCol>
                                <VTooltip bottom class="">
                                    <template #activator="{ on, attrs }">
                                        <VRow class="">
                                            <VCol class="tw-flex tw-justify-center tw-items-center">
                                                <VBtn
                                                    color="primary"
                                                    :disabled="assets.pdf ? false : true"
                                                    :loading="busy"
                                                    @click="generateFields"
                                                >
                                                    Autogenerate Fields
                                                </VBtn>
                                                <FontAwesomeIcon
                                                    class="tw-ml-1"
                                                    v-bind="attrs"
                                                    :icon="icons.faInfoCircle"
                                                    v-on="on"
                                                />
                                            </VCol>
                                        </VRow>
                                    </template>
                                    <span
                                        >Our NLP algorithms will generate the following information
                                        automatically</span
                                    >
                                </VTooltip>
                            </VCol>
                        </VRow>
                        <VRow>
                            <VCol fill-height he class="tw-py-4" md="6">
                                <VeeTextarea
                                    v-model="poster.description"
                                    :label="descriptionLabel"
                                    vid="description"
                                    hide-details="auto"
                                    clearable
                                    outlined
                                    :rows="9"
                                />
                            </VCol>
                            <VCol class="tw-py-4" md="6">
                                <VeeCombobox
                                    v-model="poster.topics"
                                    label="Topics"
                                    vid="topics"
                                    multiple
                                    small-chips
                                    clearable
                                    outlined
                                    hide-details="auto"
                                    @delete="poster.topics = $event"
                                />
                                <VeeCombobox
                                    v-model="poster.keywords"
                                    class="tw-mt-4"
                                    label="Keywords"
                                    vid="keywords"
                                    small-chips
                                    multiple
                                    clearable
                                    outlined
                                    hide-details="auto"
                                    @delete="poster.keywords = $event"
                                />
                                <VeeRadioGroup
                                    v-model="poster.visibility"
                                    label="Visibility"
                                    vid="visibility"
                                    :items="availableVisibilities"
                                />
                            </VCol>
                            <VCol cols="12">
                                <VBtn
                                    :loading="uploadState.pending"
                                    color="primary"
                                    @click="handleSubmit(savePoster)"
                                >
                                    {{ submitBtnText }}
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VStepperContent>
                </VStepperItems>
            </VStepper>
        </VContainer>
    </ValidationObserver>
</template>

<script lang="ts">
import {
    faFolderOpen,
    faFileAlt,
    faArrowLeft,
    faInfoCircle,
} from '@fortawesome/pro-regular-svg-icons'
import {
    computed,
    defineComponent,
    onMounted,
    ref,
    useContext,
    useRoute,
    useRouter,
} from '@nuxtjs/composition-api'
import { ValidationObserver } from 'vee-validate'
import { intersectionBy } from 'lodash'
import useIcons from '~/composables/common/useIcons'
import useUpload from '~/composables/upload/useUpload'
import useVisibility from '~/composables/common/useVisibility'

export enum UploadStepEnum {
    DOCUMENT = 1,
    AUTHORS = 2,
    ADDITIONAL = 3,
}

export default defineComponent({
    /*    meta: {
        permissions: (route: Route) => {
            if (route.params.uploadId !== 'new') {
                return [[Resources.POSTER, route.params.uploadId, Actions.EDIT]]
            } else {
                return [[Resources.POSTER_UPLOAD, null, Actions.CREATE]]
            }
        },
    }, */
    setup() {
        // Use Composables
        const $route = useRoute()
        const $router = useRouter()
        const { icons } = useIcons({
            faFolderOpen,
            faFileAlt,
            faArrowLeft,
            faInfoCircle,
        })
        const {
            poster,
            assets,
            uploadState,
            thumbnail,
            isGeneratingImage,
            fetchPoster,
            handlePdfInput,
            handleImageInput,
            savePoster,
            hasErrorInStep,
            pdfPreviewURL,
            fetchNLPData,
            resetPoster,
        } = useUpload()
        const { visibilities } = useVisibility()

        // Date refs
        const observer = ref<InstanceType<typeof ValidationObserver> | null>(null)

        const step = ref<UploadStepEnum>(UploadStepEnum.DOCUMENT)

        const { $accessor } = useContext()
        const busy = ref(false)
        
        $route.value.query.step = step.value.toString()
        const availableVisibilities = ref()
        // Computed
        const submitBtnText = computed(() =>
            $route.value.params.uploadId === 'new' ? 'upload' : 'update'
        )

        const descriptionLabel = computed(() => {
            return 'Description'
        })

        // Methods
        function removeUser(removedUser) {
            const index = poster.value.authors.findIndex((a) => a.id === removedUser.id)
            if (index >= 0) poster.value.authors.splice(index, 1)
        }

        async function generateFields() {
            if (assets.pdf) {
                try {
                    busy.value = true
                    await fetchNLPData(assets.pdf, poster.value.title)
                    busy.value = false
                } catch (error) {
                    busy.value = false
                }
            }
        }

        function updateStep(newVal) {
            if (newVal >= 1 || newVal <= 3) {
                step.value = newVal
                $router.replace({
                    query: {
                        step: step.value.toString(),
                    },
                })
            }
        }

        /**
         * fetchPoster uses the File constructor which is not available in Node.js
         */
        onMounted(async () => {
            if ($route.value.params.uploadId !== 'new') {
                try {
                    await fetchPoster()
                } catch (error) {
                    observer.value?.setErrors(error)
                }
            } else resetPoster()

            availableVisibilities.value = intersectionBy(
                visibilities.value,
                $accessor.tenant.getVisibilityOptions,
                (obj) => obj.value
            )
        })

        return {
            // Refs
            step,
            poster,
            assets,
            uploadState,
            isGeneratingImage,
            busy,
            // Const
            UploadStepEnum,
            // Computed
            icons,
            availableVisibilities,
            thumbnail,
            pdfPreviewURL,
            submitBtnText,
            descriptionLabel,
            // Methods
            savePoster,
            handlePdfInput,
            handleImageInput,
            hasErrorInStep,
            removeUser,
            generateFields,
            updateStep,
        }
    },
})
</script>

<style scoped></style>
