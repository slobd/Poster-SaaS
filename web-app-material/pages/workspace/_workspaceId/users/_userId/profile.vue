<template>
    <VCard class="tw-h-full tw-p-4">
        <h3 class="tw-text-lg tw-mb-2">MY DOCUMENTS</h3>
        <GalleryGrid v-if="user && user.posters" :posters="user.authoredPosters" />

        <VCard v-else class="tw-w-1/2 tw-px-4 tw-py-10 tw-mx-auto tw-mt-10 tw-text-center">
            <h4 class="text-sm">There is no content to show right now.</h4>
        </VCard>
    </VCard>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useFetch } from '@nuxtjs/composition-api'
import useExpert from '~/composables/experts/useExpert'
export default defineComponent({
    setup() {
        const { user, fetchUser } = useExpert()

        useFetch(async () => await fetchUser())

        return {
            user,
        }
    },
})
</script>

<style></style>
