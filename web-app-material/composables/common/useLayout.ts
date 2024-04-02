import { computed, useContext } from '@nuxtjs/composition-api'
import useAuthUtil from '~/composables/common/useAuthUtil'

export default function useLayout() {
    const { $auth } = useContext()
    const { isTenantMember } = useAuthUtil()

    const showGuestMessage = computed(() => {
        return $auth.loggedIn && isTenantMember.value
    })

    return {
        showGuestMessage,
    }
}
