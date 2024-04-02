import { ref, useContext } from '@nuxtjs/composition-api'
import { APIRoutesV2 } from '~/types/typing'
import { Poster } from '~/types/entities/Poster.entity'
import useUtils from '~/composables/common/useUtils'
import useVisibility from '~/composables/common/useVisibility'

export default function useGallery() {
    const { $axios, $accessor, $logger } = useContext()
    const { syncRefWithQuery } = useUtils()
    const { getDefaultVisibility } = useVisibility()

    const posters = ref<Poster[]>([])

    const visibility = ref(getDefaultVisibility.value)

    const search = ref('')

    async function fetchPosters(): Promise<void> {
        try {
            const params = _getQueryParams()
            $logger.debug(params)
            $logger.debug($accessor.workspace.getWorkspaceId)
            posters.value = await $axios.$get(
                APIRoutesV2.WORKSPACES_ID_POSTERS($accessor.workspace.getWorkspaceId),
                {
                    params,
                }
            )
        } catch (error) {
            posters.value = []
        }
    }

    function _getQueryParams(): Record<string, any> {
        const searchQueryParams =
            search.value.length > 0
                ? {
                      search: search.value,
                  }
                : {}

        return {
            visibility: visibility.value,
            ...searchQueryParams,
        }
    }

    syncRefWithQuery(visibility, 'visibility')
    syncRefWithQuery(search, 'search')

    return {
        posters,
        visibility,
        search,
        fetchPosters,
    }
}
