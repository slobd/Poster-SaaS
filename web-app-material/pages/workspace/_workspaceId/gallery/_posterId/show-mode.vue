<template>
    <div class="tw-pt-2">
        <VBtn class="tw-mb-2" @click="closeShowMode">Close show mode</VBtn>
        <VResponsive :aspect-ratio="16 / 9" max-height="calc(100vh - 52px)" class="">
            <iframe
                class="tw-w-full tw-h-full"
                :src="poster.pdf && poster.pdf.location + '#view=Fit'"
            />
        </VResponsive>
    </div>
</template>

<script>
import { computed, defineComponent, useContext, useRouter } from '@nuxtjs/composition-api'

export default defineComponent({
    setup() {
        const { $accessor } = useContext()
        const $router = useRouter()

        const poster = computed(() => $accessor.gallery.getPoster)

        function closeShowMode() {
            $accessor.gallery.setShowMode(false)
            $router.push(
                `/workspace/${$accessor.workspace.getWorkspaceId}/gallery/${poster.value.id}/document`
            )
        }

        return { poster, closeShowMode }
    },

    beforeDestroy() {
        this.$store.commit('gallery/closeShowMode')
    },
})
</script>

<style></style>
