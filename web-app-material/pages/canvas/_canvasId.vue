<template>
    <div clasS="tw-h-full">
        <UploadSuccessfulModal
            v-if="posterId"
            v-model="showModal"
            :poster-id="posterId"
            message="You poster has been edited"
        />
        <div class="tw-h-full">
            <!-- TODO: Delete -->
            <CanvasInfoBar v-if="false"></CanvasInfoBar>
            <div class="tw-flex tw-flex-col tw-h-full tw-border-t md:tw-flex-row">
                <CanvasSideBar
                    class="tw-w-full tw-px-8 md:tw-w-3/12 xl:tw-w-2/12"
                    :links="links"
                    keep-alive
                />
                <div class="tw-w-full tw-px-3 sm:tw-px-8 md:tw-w-9/12 xl:tw-w-10/12">
                    <nuxt-child />
                </div>
            </div>
        </div>
        <div
            v-if="pdfData"
            id="pdf-upload"
            class="tw-fixed"
            style="width: 600px; height: 600px; top: -600px; left: -600px"
        >
            <vue-pdf
                :page="1"
                :src="pdfData"
                style="width: 600px; height: 600px"
                @loaded="uploadPoster"
            ></vue-pdf>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import NewUsePDF from '~/composables/canvas/use/newUsePDF'
import { CanvasSubRoutesEnum, EventEmitterEnum } from '~/types/canvas'
import { dataURItoBlob, generateCanvasTitle } from '~/composables/canvas/use/useUtils'
import { FloatingBannerEnum } from '~/types/banner'

pdfMake.vfs = pdfFonts.pdfMake.vfs

export default Vue.extend({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beforeRouteUpdate(to, from, next): void {
        if (this.loadingImage) return
        next()
    },
    data() {
        return {
            numPages: 1,
            pdfData: '',
            loadingImage: false,
            pdf: null,
            showModal: false,
            links: [
                {
                    text: CanvasSubRoutesEnum.LAYOUT.toUpperCase(),
                    to: CanvasSubRoutesEnum.LAYOUT,
                },
                {
                    text: CanvasSubRoutesEnum.AUTHORS.toUpperCase(),
                    to: CanvasSubRoutesEnum.AUTHORS,
                },
                {
                    text: CanvasSubRoutesEnum.INFO.toUpperCase(),
                    to: CanvasSubRoutesEnum.INFO,
                },
                {
                    text: CanvasSubRoutesEnum.CONTENT.toUpperCase(),
                    to: CanvasSubRoutesEnum.CONTENT,
                },
                {
                    text: CanvasSubRoutesEnum.PREVIEW.toUpperCase(),
                    to: CanvasSubRoutesEnum.PREVIEW,
                },
                {
                    text: CanvasSubRoutesEnum.DOWNLOAD.toUpperCase(),
                    to: CanvasSubRoutesEnum.DOWNLOAD,
                },
            ],
        } as {
            [key: string]: any
        }
    },
    async fetch() {
        const canvasId = this.$route.params.canvasId
        this.resetCanvasState()

        if (!canvasId || canvasId === 'new') {
            this.addDefaultAuthorForNewDocument()
        } else {
            try {
                await this.$store.dispatch('canvas/fetchPoster', {
                    id: canvasId,
                })
            } catch (error) {
                if (error?.response?.status === 401) {
                    this.$nuxt.context.redirect('/gallery')
                }
            }
        }
    },
    computed: {
        authenticated(): any {
            return this.$store.state.auth.user
        },
        ...mapGetters('canvas', {
            layout: 'getLayout',
            blocks: 'getBlocks',
            title: 'getTitle',
            authors: 'getAuthors',
            findingBlock: 'getFindingBlock',
            color: 'getCategory',
            visibility: 'getVisibility',
            poster: 'getPoster',
        }),
        ...mapGetters('tenant', ['getTheme']),
        posterId(): number {
            return this.$store.state.posterUploadState.posterId
        },
    },

    mounted(): void {
        this.$nuxt.$on(EventEmitterEnum.PDF_DOWNLOAD_EVENT, async () => {
            await this.generatePDF()
        })
        this.$nuxt.$on(
            EventEmitterEnum.FILE_UPLOAD_EVENT,
            ({ loading }) => (this.loadingImage = loading)
        )
    },
    beforeDestroy(): void {
        this.$nuxt.$off(EventEmitterEnum.FILE_UPLOAD_EVENT)
    },
    methods: {
        ...mapActions('canvas', ['savePoster']),
        ...mapMutations('canvas', ['addAuthor', 'resetCanvasState']),
        addDefaultAuthorForNewDocument() {
            if (this.authors.length === 0 && this.$auth.loggedIn) {
                this.addAuthor(this.$auth.user)
            }
        },

        async generatePDF(): Promise<void> {
            const PDFDefinitions = await NewUsePDF({
                layout: this.layout,
                blocks: this.blocks,
                title: this.title,
                authors: this.authors,
                findingBlock: this.findingBlock,
                morrisonBgColor: this.color,
            })

            const pdfDocGenerator = pdfMake.createPdf(PDFDefinitions)
            pdfDocGenerator.getBlob((blob) => {
                this.pdf = new File([blob], `${generateCanvasTitle(this.title)}.pdf`)

                const tempUrl = window.URL.createObjectURL(blob)
                this.pdfData = tempUrl
            })
        },

        async uploadPoster(): Promise<void> {
            // Client side upload validation
            if (!this.title)
                return this.$store.dispatch('setBannerWithTimeout', {
                    value: true,
                    type: FloatingBannerEnum.default,
                    message: 'A title is required before uploading a canvas',
                })
            try {
                const blob = await this.getBlobFromCanvas()
                const image = new File([blob], `${generateCanvasTitle(this.title)}.jpg`)

                const user = this.$auth.user

                if (image && this.pdf && user?.email) {
                    await this.savePoster({
                        poster: { ...this.poster, user },
                        pdf: this.pdf,
                        image,
                        id: this.poster.id,
                    })

                    this.$nuxt.$off(EventEmitterEnum.PDF_DOWNLOAD_EVENT)
                }
                this.showModal = true
            } catch (error) {}
        },

        getBlobFromCanvas(): Promise<Blob> {
            return new Promise((resolve, reject) => {
                const vuePdfParent = document.getElementById('pdf-upload')
                if (vuePdfParent) {
                    // Wait for Vue-PDF to create the content of the canvas
                    setTimeout(() => {
                        const canvas = vuePdfParent.getElementsByTagName('canvas')[0]

                        resolve(dataURItoBlob(canvas.toDataURL('image/jpeg', 1)))
                    }, 1000)
                } else {
                    reject(Error)
                }
            })
        },
    },
})
</script>
