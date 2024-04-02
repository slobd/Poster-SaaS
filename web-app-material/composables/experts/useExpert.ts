import { ref, useContext, useRoute } from '@nuxtjs/composition-api'
import { APIRoutesV2 } from '~/types/typing'
import { IExpert } from '~/types/experts'

export default function useExpert() {
    const { $axios } = useContext()
    const $route = useRoute()
    const user = ref<IExpert>({} as IExpert)

    async function fetchUser(): Promise<void> {
        try {
            user.value = await $axios.$get(
                APIRoutesV2.WORKSPACES_ID_PEOPLE_ID(
                    $route.value.params.workspaceId,
                    $route.value.params.userId
                )
            )
        } catch (e) {
            user.value = {} as IExpert
        }
    }

    return {
        user,
        fetchUser,
    }
}
