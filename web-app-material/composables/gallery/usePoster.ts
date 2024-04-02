import { computed, useContext, useRoute, useRouter } from '@nuxtjs/composition-api'
import { Poster } from '~/types/entities/Poster.entity'
import { APIRoutesV2 } from '~/types/typing'

export default function usePoster() {
    const { $accessor, $axios, $logger } = useContext()
    const route = useRoute()
    const $router = useRouter()
    // Data references
    const poster = computed(() => {
        return $accessor.gallery.getPoster
    })

    // Computed
    const showMode = computed(() => $accessor.gallery.getShowMode)
    const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)

    // Methods
    async function deletePoster() {
        try {
            const posterId = route.value.params.posterId
            await $axios.$delete(APIRoutesV2.WORKSPACES_ID_POSTERS_ID(workspaceId.value, posterId))
            $router.push(`/workspace/${workspaceId}/gallery`)
        } catch (e) {
            $logger.error(e)
            $accessor.banner.setBanner({
                type: 'error',
                value: true,
                message: 'You do not have permission to delete this document',
            })
        }
    }

    function openShowMode() {
        $accessor.gallery.setShowMode(true)
    }

    function getOrganization(poster: Poster) {
        return poster.user.organizationName || ''
    }

    function generatePosterAssetName(title: string): string {
        const date = new Date()
        const currentDate =
            date.getFullYear() +
            '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) +
            '-' +
            ('0' + date.getDate()).slice(-2)
        return `${currentDate}_PosterLab_${title.slice(0, 15).split(' ').join('_')}`
    }

    function removeLead(poster: Poster) {
        return poster.authors.filter((user) => user.id !== poster.user.id)
    }

    return {
        poster,
        showMode,
        getOrganization,
        generatePosterAssetName,
        openShowMode,
        deletePoster,
        removeLead,
    }
}
