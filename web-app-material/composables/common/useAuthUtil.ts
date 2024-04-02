import { computed, useContext, useRouter } from '@nuxtjs/composition-api'
import { Role } from '~/types/entities/Role.entity'

export default function useAuthUtil() {
    const { $auth, $accessor } = useContext()
    const router = useRouter()

    /**
     * TODO: This is not longer a valid way to check if the user is member of a tenant
     */
    const isTenantMember = computed(() => {
        const user = $auth.user
        if ($auth.loggedIn && user.roles)
            return user.roles.some((role: Role) => role.tenantId === $accessor.tenant.getTenantId)
        return false
    })

    function logout() {
        $auth.logout()
        router.push('/auth/login')
    }

    return {
        isTenantMember,
        logout,
    }
}
