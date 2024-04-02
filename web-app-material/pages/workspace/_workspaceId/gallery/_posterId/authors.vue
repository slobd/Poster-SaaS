<template>
    <VCard class="tw-h-full tw-py-4 tw-px-8 tw-ml-5 tw-text-left">
        <h3 class="tw-text-base tw-mb-4">AUTHORS</h3>
        <UsersGrid v-if="poster" :users="members" :manager="poster.user" position="Lead Author" />
    </VCard>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import usePoster from '~/composables/gallery/usePoster'

export default defineComponent({
    setup() {
        const { poster } = usePoster()

        const members = computed(() => {
            return Array.isArray(poster.value.authors)
                ? poster.value.authors.filter((user) => user.id !== poster.value.user.id)
                : []
        })

        return { poster, members }
    },
})
</script>

<style></style>
