<template>
    <div
        class="
            tw-flex tw-flex-col tw-flex-1 tw-max-w-lg tw-px-8
            lg:tw-max-w-xs
            md:tw-px-16
            lg:tw-px-8
        "
    >
        <div
            class="
                tw-flex-grow
                tw-px-6
                tw-mb-4
                tw-border-2
                tw-rounded-md
                tw-border-solid
                tw-shadow-sm
                tw-py-14
            "
            :class="layout.includes(pdfType) ? 'tw-border-primary' : 'tw-border-gray-4'"
        >
            <img class="tw-max-w-full" :src="imageData.src" :alt="imageData.alt" />
        </div>
        <div class="tw-mb-2 tw-min-h-12">
            <slot></slot>
        </div>
        <div class="tw-leading-loose">
            <VRadioGroup :value="layout" @change="input">
                <VRadio
                    v-for="data in layoutData"
                    :key="`${data.label}`"
                    :label="data.label"
                    :value="data.value"
                ></VRadio>
            </VRadioGroup>
            <VRadioGroup :items="layoutData" :checked="layout" @input="input" />
        </div>
    </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'
import { PDFType } from '~/types/canvas'

export default {
    name: 'CanvasLayoutPresenter',
    props: {
        pdfType: {
            type: String,
            required: true,
        },
        imageData: {
            type: Object,
            required: true,
        },
        layoutData: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            format: PDFType.CLASSIC,
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
            updateCategory: 'updateCategory',
        }),
        input($event) {
            this.updateLayout({ layout: $event })
            this.format = $event
        },
    },
}
</script>
