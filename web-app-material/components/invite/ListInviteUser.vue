<template>
    <div class="tw-h-full">
        <VRow
            v-for="(invite, index) of invites"
            :key="index"
            class="tw-p-2"
            align="center"
            no-gutters
        >
            <VCol cols="8" class="text-body-1 tw-pr-6">
                {{ invite.email }}
            </VCol>
            <VCol cols="2">
                <VSelect
                    v-model="invite.role"
                    :items="roles.map((r) => r.name)"
                    hide-details="true"
                    class="custom invite-role"
                >
                    <template #selection="{ item }">
                        <span class="d-flex justify-end" style="width: 100%">
                            {{ item }}
                        </span>
                    </template>
                </VSelect>
            </VCol>
            <VBtn
                small
                icon
                color="black accent-1"
                class="assignee-remove"
                @click="$emit('remove', index)"
            >
                <VIcon color="primary">mdi-close-circle-outline</VIcon>
            </VBtn>
        </VRow>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from '@nuxtjs/composition-api'
export interface UserInvite {
    email: string
    role: string
    roleId: number | null
}
export default defineComponent({
    name: 'AddInviteUser',
    props: {
        invites: {
            type: Array as PropType<UserInvite[]>,
            default: () => [],
        },
        roles: {
            type: Array,
            default: () => [],
        },
    },
    setup() {
        const email = ref()
        return {
            email,
        }
    },
})
</script>

<style scoped>
.custom.v-text-field >>> .v-input__control > .v-input__slot:before {
    border-style: none;
}
.custom.v-text-field >>> .v-input__control > .v-input__slot:after {
    border-style: none;
}

.invite-role {
    @apply tw-pt-0 tw-mt-0;
}
</style>
