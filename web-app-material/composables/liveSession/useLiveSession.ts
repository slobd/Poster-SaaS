import { computed, useContext } from '@nuxtjs/composition-api'
import { APIRoutes } from '~/types/typing'

export default function useLiveSession() {
    const { $auth, $axios } = useContext()

    const isModerator = computed(async () => {
        if (!$auth.user.roles) {
            return false
        }

        const canUser = await $axios.$post(APIRoutes.IAM_CAN_USER, {
            resource: 'LIVE_SESSION',
            action: 'CREATE',
        })

        return canUser
    })

    return {
        isModerator,
    }
}
