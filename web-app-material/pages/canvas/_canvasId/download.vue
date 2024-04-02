<template>
    <div class="tw-flex tw-flex-col tw-w-full lg:tw-flex-row">
        <!-- Left column with download and share option -->
        <div class="tw-flex tw-flex-col tw-w-full lg:tw-w-6/12">
            <CanvasDownloadPDF />
            <VDivider />
            <div class="tw-w-full py-8">
                <h3 class="tw-mb-6 tw-text-xl tw-text-left">Save it in the Gallery</h3>
                <p v-if="$auth.loggedIn" class="tw-w-2/3 tw-text-sm">
                    Save the canvas in the gallery.
                </p>
                <p v-else class="w-2/3 text-sm">Please register to add the canvas to the Gallery</p>

                <VeeRadioGroup
                    v-if="$auth.loggedIn"
                    v-model="selectedVisibility"
                    :value="selectedVisibility"
                    label="Visibility"
                    vid="visibility"
                    :row="true"
                    :items="availableVisibilities"
                />

                <VBtn
                    v-if="$auth.loggedIn"
                    color="primary"
                    class="tw-mt-6 tw-mb-3"
                    :loading="posterUploadState.loading"
                    @click="savePoster"
                >
                    {{ addOrUpdateCanvas }}
                    <FontAwesomeIcon class="tw-ml-2" :icon="icons.faFileImport"></FontAwesomeIcon>
                </VBtn>
                <nuxt-link v-else to="/auth/register">
                    <VBtn color="primary" class="tw-mt-6"> Create Account </VBtn>
                </nuxt-link>
                <p v-if="posterUploadState.posterId">
                    Poster saved successfully. View in
                    <nuxt-link
                        class="tw-text-blue-600"
                        :to="`/gallery/${posterUploadState.posterId}/document`"
                    >
                        Gallery
                    </nuxt-link>
                </p>
                <p v-if="posterUploadState.error" class="tw-text-red-600">
                    {{ posterUploadState.error }}
                </p>
            </div>
            <!-- <VDivider />
            <CanvasDownloadShare /> -->
        </div>
        <div class="tw-hidden lg:tw-block lg:tw-w-1/12 tw-xl:w-2/12"></div>
        <!-- Right column with subscribe and survey options -->
        <div class="tw-flex tw-flex-col tw-items-start tw-w-full lg:tw-w-5/12 tw-xl:w-4/12">
            <!-- Subscribe card -->
            <VCard class="tw-w-full tw-mt-4 tw-bg-primary">
                <VCardText>
                    <h5 class="tw-mt-4 tw-text-lg tw-font-semibold tw-text-white">Stay Alert!</h5>
                    <p class="tw-mt-4 tw-text-white">
                        Don't miss the very interesting newsletters sent by our Communication
                        Manager.
                    </p>
                </VCardText>
                <VCardActions>
                    <VBtn
                        href="https://posterlab.us20.list-manage.com/subscribe?u=026ac9b2b2845725b3e11ed3d&id=44faafc80f"
                        target="_blank"
                    >
                        Subscribe
                    </VBtn>
                </VCardActions>
            </VCard>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
// CanvasDownloadPDF needs import to work
import { defineComponent, onMounted, ref, useContext } from '@nuxtjs/composition-api'
import { faFileImport } from '@fortawesome/pro-solid-svg-icons'
import { intersectionBy } from 'lodash'
import { EventEmitterEnum } from '~/types/canvas'
import CanvasDownloadPDF from '~/components/canvas/CanvasDownloadPDF.vue'
import useIcons from '~/composables/common/useIcons'
import useVisibility from '~/composables/common/useVisibility'
pdfMake.vfs = pdfFonts.pdfMake.vfs

export default defineComponent({
    components: { CanvasDownloadPDF },
    setup() {
        const { visibilities } = useVisibility()

        const { icons } = useIcons({
            faFileImport,
        })
        const availableVisibilities = ref([])
        const { $accessor } = useContext()

        onMounted(() => {
            availableVisibilities.value = intersectionBy(
                visibilities.value,
                $accessor.tenant.getVisibilityOptions,
                (obj) => obj.value
            )
        })
        return {
            icons,
            visibilities,
            availableVisibilities,
        }
    },
    data() {
        return {
            selectedVisibility: this.$accessor.canvas.getVisibility,
        }
    },
    computed: {
        ...mapGetters('canvas', {
            visibility: 'getVisibility',
            posterUploadState: 'getPosterUploadState',
        }),
        ...mapGetters('tenant', ['getTheme', 'getVisibilityOptions']),
        // TODO: Refactor

        addOrUpdateCanvas() {
            return this.$route.params.canvasId.includes('new')
                ? 'Add to the Gallery'
                : 'Update Canvas'
        },
        posterVisibilityData() {
            return this.getVisibilityOptions
        },
    },
    beforeDestroy() {
        // this.$nuxt.$off(EventEmitterEnum.PDF_DOWNLOAD_EVENT)
    },
    methods: {
        ...mapMutations('canvas', {
            setVisibility: 'setVisibility',
        }),
        savePoster() {
            try {
                this.setVisibility({ visibility: this.selectedVisibility })
                this.$nextTick(() => {
                    this.$nuxt.$emit(EventEmitterEnum.PDF_DOWNLOAD_EVENT)
                })
            } catch (error) {}
        },
    },
})
</script>
