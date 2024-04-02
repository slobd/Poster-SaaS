import { useContext } from '@nuxtjs/composition-api'
import { APIRoutesV2 } from '~/types/typing'

export default function useWorkspace() {
    const { $accessor, $auth, $logger, $axios } = useContext()

    async function fetchWorkspace(): Promise<void> {
        if ($accessor.workspace.getWorkspaceId)
            await $accessor.workspace.fetchWorkspace({
                id: $accessor.workspace.getWorkspaceId,
            })
    }

    async function updateWorkspace(
        workspaceId: number,
        name: string,
        visibility: string
    ): Promise<void> {
        const data = {
            name,
            visibility,
        }
        await $accessor.workspace.updateWorkspace({
            id: workspaceId,
            data,
        })
        await $accessor.workspace.fetchAllWorkspace({
            search: $accessor.project.getSearchKey,
            tenantId: $auth.user.id,
        })
    }

    async function deleteWorkspace(workspaceId: number): Promise<void> {
        try {
            await $axios.$delete(APIRoutesV2.WORKSPACES_ID(workspaceId))
            await $accessor.workspace.fetchAllWorkspace({
                search: $accessor.project.getSearchKey,
                tenantId: $auth.user.id,
            })
        } catch (error) {
            $logger.error(error)
        }
    }

    return {
        fetchWorkspace,
        updateWorkspace,
        deleteWorkspace,
    }
}
