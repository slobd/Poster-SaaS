<template>
    <VTable data-cy="UsersTable">
        <VTableHead class="tw-h-8">
            <VTableTr>
                <VTableTh v-if="columns.includes('firstName') && columns.includes('lastName')">
                    NAME
                </VTableTh>
                <VTableTh v-if="columns.includes('email')"> EMAIL </VTableTh>
                <VTableTh
                    v-if="columns.includes('organization') || columns.includes('organizationName')"
                >
                    ORGANIZATION
                </VTableTh>
                <VTableTh v-if="columns.includes('role')"> ROLE </VTableTh>
                <VTableTh>ACTION</VTableTh>
            </VTableTr>
        </VTableHead>
        <VTableBody>
            <VTableTr
                v-for="(user, index) in users"
                :key="`user ${index}`"
                class="hover:tw-bg-pl-gray-2 tw-cursor-pointer"
            >
                <VTableTd
                    v-if="columns.includes('firstName') && columns.includes('lastName')"
                    class="tw-w-60"
                >
                    <div class="tw-flex tw-items-center tw-space-x-2 lg:tw-space-x-2">
                        <CanvasProfileImage
                            v-if="user && user.email"
                            :user="user"
                            :size="eVProfileImageSize.sm"
                        />
                        <div>
                            <p class="tw-font-medium tw-text-xs tw-m-0">
                                <span>
                                    {{ user.firstName }}
                                    {{ user.lastName }}
                                </span>
                                <span
                                    v-if="index === 0"
                                    class="
                                        tw-flex-shrink-0
                                        tw-inline-block
                                        tw-px-2
                                        tw-py-0.5
                                        tw-text-green-800
                                        tw-text-xxs
                                        tw-font-medium
                                        tw-bg-green-100
                                        tw-rounded-full
                                    "
                                >
                                    {{ leadText }}
                                </span>
                                <span
                                    v-else-if="user.isDummyUser"
                                    class="
                                        tw-flex-shrink-0
                                        tw-inline-block
                                        tw-px-2
                                        tw-py-0.5
                                        tw-text-yellow-800
                                        tw-text-xxs
                                        tw-font-medium
                                        tw-bg-yellow-100
                                        tw-rounded-full
                                    "
                                >
                                    {{ pendingText }}
                                </span>
                            </p>
                        </div>
                    </div>
                </VTableTd>

                <VTableTd
                    v-if="columns.includes('email')"
                    class="tw-text-sm tw-leading-5 tw-text-gray-900"
                >
                    <p class="tw-m-0">{{ user.email }}</p>
                </VTableTd>
                <VTableTd
                    v-if="columns.includes('organization') || columns.includes('organizationName')"
                    class="tw-text-sm tw-leading-5 tw-text-gray-900"
                >
                    <p class="tw-m-0">{{ user.organization || user.organizationName }}</p>
                </VTableTd>
                <VTableTd
                    v-if="columns.includes('role')"
                    class="tw-text-sm tw-leading-5 tw-text-gray-900"
                >
                    <p class="tw-m-0">{{ user.role }}</p>
                </VTableTd>
                <VTableTd class="tw-text-sm tw-leading-5">
                    <template v-if="index !== 0">
                        <VBtn
                            small
                            color="error"
                            class="tw-mr-auto"
                            @click.prevent="$emit('deleteAction', index, user)"
                        >
                            Delete
                        </VBtn>
                    </template>
                </VTableTd>
            </VTableTr>
        </VTableBody>
    </VTable>
</template>

<script>
import Vue from 'vue'
import { EVProfileImageSize } from '@/components/canvas/CanvasProfileImage.vue'

export default Vue.extend({
    name: 'CanvasUsersTable',
    props: {
        leadText: {
            type: String,
            default: 'Lead author',
        },
        pendingText: {
            type: String,
            default: 'Pending invitation',
        },
        newText: {
            type: String,
            default: 'New invitation',
        },
        columns: {
            type: Array,
            default: () => ['firstName', 'lastName', 'email', 'organization'],
        },
        users: {
            type: Array,
            default() {
                return []
            },
        },
    },
    data: () => {
        return {
            eVProfileImageSize: EVProfileImageSize,
        }
    },
})
</script>
