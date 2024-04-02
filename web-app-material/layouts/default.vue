<template>
    <VApp :key="key">
        <AppNavigationDrawer />
        <VMain>
            <Nuxt />
        </VMain>
        <client-only>
            <FloatingBanner
                :value="$accessor.banner.getBanner.value"
                :type="$accessor.banner.getBanner.type"
                :message="$accessor.banner.getBanner.message"
                @input="hideFloatingBanner"
            />
        </client-only>
    </VApp>
</template>

<script lang="ts">
import { defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
    name: 'DefaultLayout',
    setup() {
        const { $accessor } = useContext()
        const key = $accessor.iam.key

        function hideFloatingBanner() {
            $accessor.banner.setBanner({
                value: false,
            })
        }

        return {
            hideFloatingBanner,
            key,
        }
    },
    async mounted() {
        if (this.$route.query.access_token) {
            await this.$auth.setUserToken(this.$route.query.access_token as string)
            await this.$auth.fetchUser()
        }

        if (this.$auth.user) {
            await this.$accessor.iam.fetchAllUserRules()
        }

        const workspaceIdParam = parseInt(this.$route.params.workspaceId)
        if (!Number.isNaN(workspaceIdParam))
            this.$accessor.workspace.setWorkspaceId(workspaceIdParam)
        else if (!this.$accessor.workspace.getWorkspaceId && this.$auth.loggedIn) {
            if (this.$auth.user.workspaces.length > 0) {
                this.$accessor.workspace.setWorkspaceId(this.$auth.user.workspaces[0].id)
            }
        }

        if (this.$accessor.workspace.getWorkspaceId)
            await this.$accessor.workspace.fetchWorkspace({
                id: this.$accessor.workspace.getWorkspaceId,
            })
    },
})
</script>

<style></style>
