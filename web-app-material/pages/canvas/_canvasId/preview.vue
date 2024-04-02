<template>
    <div>
        <CanvasIdHeader>
            <div class="tw-flex tw-justify-between">
                <h3 class="text-2xl">
                    {{ pageTitle }}
                </h3>
            </div>
            <div class="tw-pb-8 tw-text-xs">
                Get a preview of your canvas. You can go back to <br />
                the previous step if you want to make changes.
            </div>
        </CanvasIdHeader>

        <div class="tw-hidden tw-h-screen tw-mb-16 tw-mt-6 sm:tw-block">
            <iframe
                :src="pdfData + '#view=Fit'"
                type="application/pdf"
                height="100%"
                width="100%"
            ></iframe>
        </div>
        <div class="tw-block tw-mb-16 tw-border tw-px-auto sm:tw-hidden">
            <client-only>
                <div id="canvasPDF" class="relative">
                    <vue-pdf
                        v-for="i in numPages"
                        :key="i"
                        :page="i"
                        class="tw-w-full tw-h-full"
                        :src="pdfData"
                        @num-pages="updateNumPages"
                    ></vue-pdf>
                </div>
            </client-only>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import NewUsePDF from '~/composables/canvas/use/newUsePDF'
pdfMake.vfs = pdfFonts.pdfMake.vfs

export default Vue.extend({
    data() {
        return {
            format: '',
            pdfData: '',
            pageTitle: 'Preview',
            numPages: 1,
        }
    },
    computed: {
        ...mapGetters('canvas', {
            layout: 'getLayout',
            blocks: 'getBlocks',
            title: 'getTitle',
            authors: 'getAuthors',
            findingBlock: 'getFindingBlock',
            color: 'getCategory',
        }),
    },
    beforeMount() {
        this.generatePDF()
    },
    methods: {
        async generatePDF() {
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
                const tempUrl = window.URL.createObjectURL(blob)
                this.pdfData = tempUrl
            })
        },
        updateNumPages(pages?: number) {
            if (pages) this.numPages = pages
        },
    },
})
</script>
