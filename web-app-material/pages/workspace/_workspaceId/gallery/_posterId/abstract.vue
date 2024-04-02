<template>
    <VCard class="tw-p-4 tw-ml-5">
        <h3 class="tw-text-base tw-px-4 tw-text-left">ABSTRACT</h3>
        <VCardText v-if="poster">
            {{ poster.description }}
        </VCardText>
    </VCard>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import usePoster from '~/composables/gallery/usePoster'

export default defineComponent({
    setup() {
        const { poster } = usePoster()

        return { poster }
    },
})
</script>

<style></style>
