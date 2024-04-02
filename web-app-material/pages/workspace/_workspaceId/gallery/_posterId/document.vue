<template>
    <VContainer class="tw-h-full">
        <VRow class="tw-h-full">
            <VCol cols="8">
                <VResponsive
                    :aspect-ratio="16 / 9"
                    style="height: calc(100% - 48px)"
                    class="tw-h-full"
                >
                    <iframe class="tw-w-full tw-h-full" :src="poster.pdf && poster.pdf.location" />
                </VResponsive>
            </VCol>
            <VCol cols="4" class="tw-bg-white">
                <CommentBox />
            </VCol>
        </VRow>
    </VContainer>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { subject } from '@casl/ability'
import usePoster from '~/composables/gallery/usePoster'

export default defineComponent({
    setup() {
        const { poster } = usePoster()
        const caslPoster = computed(() => subject('Poster', poster.value))
        return { poster, caslPoster }
    },
})
</script>

<style></style>
