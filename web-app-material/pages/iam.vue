<template>
    <div class="tw-h-full tw-overflow-y-auto">
        <VContainer fluid>
            <div class="h-5">
                <h1 class="tw-text-lg sm:tw-text-2xl">User Management</h1>
                <VSpacer />
            </div>
        </VContainer>
        <VDivider />
        <VContainer fluid>
            <VRow no-gutters>
                <VCol md="4" lg="3">
                    <VTabs vertical>
                        <VTab v-for="link in links" :key="link.text" :to="link.to">
                            {{ link.text }}
                            <VSpacer />
                        </VTab>
                    </VTabs>
                </VCol>
                <VCol md="8" lg="9">
                    <NuxtChild />
                </VCol>
            </VRow>
        </VContainer>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Actions, Resources } from '~/types/iam'

export default Vue.extend({
    data() {
        return {
            links: [
                {
                    text: 'MANAGE USERS',
                    to: '/iam/manage-users',
                    permission: {
                        resource: Resources.USER,
                        action: Actions.ADD,
                    },
                },
                {
                    text: 'ROLES AND PERMISSIONS',
                    to: '/iam/roles-and-permissions',
                    permission: {
                        resource: Resources.ROLE,
                        action: Actions.ADMIN,
                    },
                },
            ],
        }
    },
})
</script>
