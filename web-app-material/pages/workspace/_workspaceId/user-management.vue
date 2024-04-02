<template>
    <VContainer fluid class="tw-h-full tw-bg-gray-100 tw-text-left">
        <WebMetadata />
        <VRow class="tw-pl-8 tw-pr-3 tw-bg-gray-100 tw-sticky tw-top-0 tw-z-10">
            <div class="col-12 tw-pl-0 tw-pr-3 tw-py-2 tw-mt-1 tw-mb-3">
                <div class="tw-flex tw-justify-between tw-items-center">
                    <span class="tw-font-bold tw-text-lg">Workspace / User Management</span>
                    <VBtn text dense @click="backToBefore">
                        <FontAwesomeIcon :icon="icons.faArrowLeft" class="tw-mx-1" />
                        <span class="">BACK</span>
                    </VBtn>
                </div>
            </div>
        </VRow>
        <VDivider class="tw--ml-3 tw--mr-4 tw-mr-0 col-12 tw-py-0 tw-fixed tw-z-10" />
        <VRow class="tw-pl-2 tw-bg-gray-100 tw-text-xs tw-my-0 tw-z-0">
            <div class="tw-px-6 tw-pt-4 col-12 tw-flex tw-items-center tw-justify-between">
                <VTextField
                    v-model="search"
                    class="col-6 tw-ml-0"
                    append-icon="mdi-magnify"
                    label="Search"
                    single-line
                    hide-details
                    outlined
                    height="10"
                    dense
                >
                </VTextField>
                <VBtn class="tw-text-xl" color="primary" @click="$accessor.setInviteModal(true)">
                    <span>INVITE</span>
                </VBtn>
            </div>
            <VDataTable
                class="tw-bg-gray-100 col-12 tw-shadow-none"
                :headers="headers"
                :items="users"
                :search="search"
            >
                <template #item.role="{ item }">
                    <VSelect
                        :value="item.roles[0].id"
                        class="offset-2 col-8 tw-mt-1"
                        item-text="name"
                        item-value="id"
                        :items="getRolesBasedOnUser(item)"
                        outlined
                        dense
                        :disabled="item.roles[0].name === 'Owner'"
                        @change="changeRole($event, item)"
                    ></VSelect>
                </template>
                <template #item.actions="{ item }">
                    <VBtn
                        v-if="showDeleteButton(item)"
                        plain
                        target="_blanket"
                        fab
                        class="tw-text-black"
                        :disabled="item.roles[0].name === 'Owner'"
                        @click="openDeleteModal(item.id)"
                    >
                        <FontAwesomeIcon :icon="icons.faTrashAlt" class="tw-mx-1" />
                    </VBtn>
                </template>
            </VDataTable>
            <VDialog v-model="dialogDelete" max-width="500px">
                <VCard>
                    <VCardTitle class="text-h5">
                        Are you sure you want to delete this item?
                    </VCardTitle>
                    <VCardActions>
                        <VSpacer></VSpacer>
                        <VBtn color="blue darken-1" text @click="dialogDelete = false">Cancel</VBtn>
                        <VBtn color="blue darken-1" text @click="deleteItemConfirm">OK</VBtn>
                        <VSpacer></VSpacer>
                    </VCardActions>
                </VCard>
            </VDialog>
        </VRow>
    </VContainer>
</template>

<script lang="ts">
import {
    faGripHorizontal,
    faThList,
    faUpload,
    faSearch,
    faTrashAlt,
    faArrowLeft,
} from '@fortawesome/pro-solid-svg-icons'
import {
    defineComponent,
    ref,
    useFetch,
    useContext,
    useRouter,
    useRoute,
    computed,
} from '@nuxtjs/composition-api'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'UserManagement',
    setup() {
        const { icons } = useIcons({
            faGripHorizontal,
            faThList,
            faUpload,
            faSearch,
            faTrashAlt,
            faArrowLeft,
        })
        const { $accessor, $auth } = useContext()

        const router = useRouter()
        const $route = useRoute()

        const search = ref('')
        const headers = [
            {
                text: 'First Name',
                align: 'start',
                value: 'firstName',
            },
            { text: 'Last Name', value: 'lastName' },
            { text: 'Email', value: 'email' },
            { text: 'Role', value: 'role', align: 'center' },
            { text: 'Company', value: 'organizationName' },
            { text: 'Actions', value: 'actions', sortable: false },
        ]

        const dialogDelete = ref(false)
        const deleteId = ref<number | null>(null)

        const users = computed(() => $accessor.iam.getUsers)
        const roles = computed(() => $accessor.iam.getRoles)

        const getRolesBasedOnUser = (user) =>
            user.roles && user.roles[0]?.name === 'Owner'
                ? $accessor.iam.getRoles
                : $accessor.iam.getRoles.filter((r) => r.name !== 'Owner')

        useFetch(async () => {
            await $accessor.iam.fetchUsers({
                workspaceId: parseInt($route.value.params.workspaceId),
            })
            await $accessor.iam.fetchRoles(`Workspace/${$route.value.params.workspaceId}`)
        })

        const backToBefore = () => {
            router.go(-1)
        }

        async function changeRole(newRoleId: number, user: any) {
            const isSameRole = user.roles[0].id === newRoleId

            if (isSameRole) return

            const role = roles.value.find((role) => role.id === newRoleId)

            if (role) {
                await updateWorkspaceUserRole(user.id, role.id)
            }
        }

        async function updateWorkspaceUserRole(userId: number, roleId: number): Promise<void> {
            const data = {
                userId,
                roleId,
            }

            await $accessor.iam.updateWorkspaceUserRole({
                workspaceId: parseInt($route.value.params.workspaceId),
                userId,
                data,
            })
        }

        const openDeleteModal = (id: number) => {
            deleteId.value = id
            dialogDelete.value = true
        }

        const deleteItemConfirm = async () => {
            await $accessor.iam.deleteWorkspaceUser({
                workspaceId: $accessor.workspace.getWorkspaceId as number,
                userId: deleteId.value as number,
            })

            dialogDelete.value = false
            deleteId.value = null
        }

        function showDeleteButton(item): boolean {
            return !(item.roles[0].name === 'Owner' || item.id === $auth.user.id)
        }

        const showInviteModal = ref(false)

        return {
            icons,
            search,
            headers,
            users,
            roles,
            getRolesBasedOnUser,
            showInviteModal,
            dialogDelete,
            backToBefore,
            changeRole,
            openDeleteModal,
            deleteItemConfirm,
            showDeleteButton,
        }
    },
})
</script>

<style scoped>
.v-text-field__details {
    display: none;
}
</style>
