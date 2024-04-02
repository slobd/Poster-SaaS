import { computed, useContext } from '@nuxtjs/composition-api'
import { UserInvite } from '~/components/invite/ListInviteUser.vue'
import { APIRoutesV2 } from '~/types/typing'

export default function useUserInvite() {
    const { $accessor, $axios } = useContext()

    const roles = computed(() => {
        if (Array.isArray($accessor.iam.getRoles)) {
            return $accessor.iam.getRoles.filter((role) => role.name !== 'Owner').reverse()
        } else {
            return []
        }
    })

    async function fetchRoles() {
        if ($accessor.workspace.getWorkspaceId)
            await $accessor.iam.fetchRoles(`Workspace/${$accessor.workspace.getWorkspaceId}`)
    }

    async function sendInvitations(invitations: UserInvite[], workspaceId: number) {
        const trimmedInvitations = invitations.map((i) => ({
            ...i,
            email: i.email.trim(),
        }))
        for (const invitation of trimmedInvitations) {
            await $axios.post(APIRoutesV2.IAM__INVITE, {
                workspaceId: workspaceId,
                tenantId: $accessor.tenant.getTenantId,
                ...invitation,
            })
        }
    }

    return {
        roles,
        fetchRoles,
        sendInvitations,
    }
}
