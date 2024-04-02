<template>
    <div>
        <CanvasIdHeader> Select the <strong>layout</strong> of your canvas</CanvasIdHeader>

        <div
            class="
                tw-flex tw-flex-col tw-items-center tw-py-6
                lg:tw-items-stretch lg:tw-flex-row lg:tw-justify-start
            "
        >
            <!-- Simple -->
            <CanvasLayoutPresenter
                :pdf-type="pdfType.SIMPLE"
                :layout-data="layoutData.simple"
                :image-data="{
                    src: require('~/static/canvas/layouts/A4_SIMPLE.png'),
                    alt: 'Scientific canvas simple layout',
                }"
            >
                <h3 class="tw-font-bold">Simple A4</h3>
                <span class="tw-text-sm"> (No image) </span>
            </CanvasLayoutPresenter>

            <!-- Classic -->
            <CanvasLayoutPresenter
                :pdf-type="pdfType.CLASSIC"
                :layout-data="layoutData.classic"
                :image-data="{
                    src: require('~/static/canvas/layouts/A4_CLASSIC.png'),
                    alt: 'Scientific canvas classic layout',
                }"
            >
                <h3 class="tw-font-bold">Classic A4</h3>
                <span class="tw-text-sm">With pictures (figures, graphs...)</span>
            </CanvasLayoutPresenter>

            <!-- Morrison -->
            <!-- <CanvasLayoutPresenter
                :pdf-type="pdfType.MORRISON"
                :layout-data="layoutData.morrison"
                :image-data="{
                    src: require('~/static/canvas/layouts/MORRISON.png'),
                    alt: 'Scientific canvas morrison layout',
                }"
            >
                <template>
                    <h3 class="tw-font-bold">
                        Based on
                        <a class="tw-underline" href="https://osf.io/ef53g/" target="_blank">
                            Mike Morrison</a
                        >
                        Better Scientific Poster design
                    </h3>
                </template>
            </CanvasLayoutPresenter> -->
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapMutations } from 'vuex'
import CanvasLayoutPresenter from '~/components/canvas/CanvasLayoutPresenter.vue'
import { layoutData, morrisonTypeData, PDFLayout, PDFType } from '~/types/canvas'

export default Vue.extend({
    components: { CanvasLayoutPresenter },
    data() {
        return {
            format: PDFType.SIMPLE as PDFType,
            pdfType: PDFType,
            pdfLayout: PDFLayout,
            layoutData,
            morrisonTypeData,
            layouts: [
                {
                    type: PDFType.SIMPLE,
                    items: layoutData.simple,
                    file: {
                        src: '~/assets/img/poster-image-classic.png',
                        alt: 'Scientific Canvas Example',
                    },
                },
                {
                    type: PDFType.CLASSIC,
                    items: layoutData.classic,
                    file: {
                        src: '~/assets/img/poster-image-classic.png',
                        alt: 'Scientific Canvas Example',
                    },
                },
                {
                    type: PDFType.MORRISON,
                    items: layoutData.morrison,
                    file: {
                        src: '~/assets/img/poster-image-morrison.png',
                        alt: 'Scientific Canvas Example',
                    },
                },
            ],
        }
    },
    computed: {
        ...mapGetters('canvas', {
            layout: 'getLayout',
        }),
    },
    methods: {
        ...mapMutations('canvas', {
            updateLayout: 'updateLayout',
        }),
    },
})
</script>
