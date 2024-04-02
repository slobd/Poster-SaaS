<template>
    <VCard class="tw-p-5">
        <ValidationObserver v-slot="{ handleSubmit, invalid }" slim>
            <VCardTitle class="tw-flex tw-items-center tw-justify-between tw-py-6 ">
                <span v-if="createWorkspaceModelAttributes.newWorkspace">Add new workspace</span>
                <span v-else>Workspace settings</span>
            </VCardTitle>
            <VCardText>
                <ValidationProvider
                    v-slot="vpWorkspaceName"
                    name="worspace name"
                    mode="eager"
                    rules="required"
                >
                    <VTextField
                        v-model="currentWorkspaceTemp.name"
                        label="Workspace name"
                        :error-messages="vpWorkspaceName.errors"
                        outlined
                    ></VTextField>
                </ValidationProvider>
                <ValidationProvider
                    v-slot="vpWorkspaceVisibility"
                    name="worspace visibility"
                    mode="eager"
                    rules="required"
                >
                    <VSelect
                        v-model="selectedVisibility"
                        :items="visibilitiesOptions"
                        label="Visibility"
                        outlined
                        background-color="white"
                        :error-messages="vpWorkspaceVisibility.errors"
                    ></VSelect>
                </ValidationProvider>
                <div class="grey--text text--darken-1 tw-px-6 tw-pb-5 tw-text-xs">
                    <div class="tw-pb-1">
                        <b>Organization: </b>Organization members can see and optionally join the
                        workspace
                    </div>
                    <div class="tw-pb-1">
                        <b>Private: </b>Only you and invited members can see and participate in the
                        workspace
                    </div>
                    <div class="tw-pb-1">
                        <b>Shareable: </b> The workspace is accessible to anybody with the link
                    </div>
                </div>
                <div v-if="selectedVisibility === 'PRIVATE'">
                    <AddInviteUser title="Share with" :roles="roles" @add="addInvite" />
                    <div
                        v-if="invites.length > 0"
                        class="grey lighten-3 overflow-auto tw-px-2 tw-max-h-32 tw-mb-2"
                    >
                        <ListInviteUser :roles="roles" :invites="invites" @remove="removeInvite" />
                    </div>
                </div>
                <VCardActions class="tw-flex tw-justify-end">
                    <VBtn text @click="cancelWorkspace">Cancel</VBtn>
                    <VBtn
                        v-if="createWorkspaceModelAttributes.newWorkspace"
                        color="primary"
                        :disabled="invalid"
                        @click="handleSubmit(createWorkspace)"
                    >
                        <span>Create</span>
                    </VBtn>
                    <VBtn
                        v-else
                        color="primary"
                        :disabled="invalid"
                        @click="handleSubmit(editWorkspace)"
                    >
                        <span>Update</span>
                    </VBtn>
                </VCardActions>
            </VCardText>
        </ValidationObserver>
    </VCard>
</template>
<script lang="ts">
import {
    computed,
    defineComponent,
    onMounted,
    ref,
    useContext,
    useRouter,
} from '@nuxtjs/composition-api'
import cloneDeep from 'lodash/cloneDeep'
import useWorkspace from '~/composables/workspace/useWorkspace'
import { APIRoutesV2 } from '~/types/typing'
import useUserInvite from '../../composables/experts/useUserInvite'
import { WorkspaceVisibilityEnum } from '~/types/entities/WorkspaceVisibility.entity'
import { UserInvite } from '../invite/ListInviteUser.vue'
import { Role } from '../../types/entities/Role.entity'

export default defineComponent({
    name: 'WorkspaceForm',
    setup() {
        const { $accessor, $logger, $axios } = useContext()
        const { updateWorkspace } = useWorkspace()
        const { sendInvitations } = useUserInvite()
        const router = useRouter()
        const currentWorkspace = $accessor.workspace.getDefaultWorkspace

        const visibilitiesOptions = ['PRIVATE', 'ORGANIZATION']

        const selectedVisibility = ref('ORGANIZATION')
        const currentWorkspaceTemp = ref()
        const invites = ref<UserInvite[]>([])
        const buttonLoading = ref(false)
        const roles = ref([
            {
                id: 1,
                name: 'Guest',
            },
            {
                id: 2,
                name: 'Member',
            },
            {
                id: 3,
                name: 'Admin',
            },
        ])

        // Computed
        const createWorkspaceModelAttributes = computed(() => {
            return $accessor.workspace.getCreateWorkspaceModal
        })

        onMounted(() => {
            if (!createWorkspaceModelAttributes.value.newWorkspace) {
                if (
                    $accessor.workspace.getDefaultWorkspace.visibility ===
                    WorkspaceVisibilityEnum.ORGANIZATION
                ) {
                    selectedVisibility.value = 'ORGANIZATION'
                } else selectedVisibility.value = $accessor.workspace.getDefaultWorkspace.visibility
            }
        })
        /* -- Methods -- */
        // API actions
        async function createWorkspace() {
            const workspace = await $accessor.workspace.createWorkspace({
                visibility:
                    selectedVisibility.value === 'ORGANIZATION'
                        ? WorkspaceVisibilityEnum.ORGANIZATION
                        : WorkspaceVisibilityEnum.PRIVATE,
                tenantId: currentWorkspaceTemp.value.tenantId,
                name: currentWorkspaceTemp.value.name,
            })

            if (invites.value.length > 0) await _sendUserInvitations(workspace.id)

            $accessor.workspace.setCreateWorkspaceModal({
                newWorkspace: false,
                status: false,
            })

            await fetchAllWorkspace()
            router.push('/workspace')
        }

        async function editWorkspace() {
            await updateWorkspace(
                Number($accessor.workspace.getWorkspaceId),
                currentWorkspaceTemp.value.name,
                selectedVisibility.value === 'ORGANIZATION'
                    ? WorkspaceVisibilityEnum.ORGANIZATION
                    : WorkspaceVisibilityEnum.PRIVATE
            )

            if (invites.value.length > 0)
                await _sendUserInvitations($accessor.workspace.getWorkspaceId)

            $accessor.workspace.setCreateWorkspaceModal({
                newWorkspace: false,
                status: false,
            })

            await fetchAllWorkspace()
        }

        async function fetchAllWorkspace() {
            await $accessor.workspace.fetchAllWorkspace({
                search: $accessor.workspace.getSearchKey,
                tenantId: $accessor.tenant.getTenantId as number,
            })
        }

        function setCurrentWorkspace() {
            if (createWorkspaceModelAttributes.value.newWorkspace) {
                currentWorkspaceTemp.value = {
                    name: '',
                    visibility: WorkspaceVisibilityEnum.ORGANIZATION,
                    tenantId: $accessor.tenant.getTenantId as number,
                }
            } else {
                currentWorkspaceTemp.value = cloneDeep(currentWorkspace)
            }
        }

        function cancelWorkspace() {
            $accessor.workspace.setCreateWorkspaceModal({
                newWorkspace: false,
                status: false,
            })
        }

        function addInvite(event) {
            if (invites.value.filter((invite) => invite.email === event.email).length === 0) {
                invites.value.push(event)
            }
        }

        function removeInvite(index) {
            invites.value.splice(index, 1)
        }

        async function _sendUserInvitations(workspaceId) {
            if (invites.value.length === 0) return

            buttonLoading.value = true

            const currentWorkspace = await $axios.get(APIRoutesV2.WORKSPACES_ID(workspaceId))

            const workspaceRoles = currentWorkspace.data.tenant.roles

            _replaceRoleIDs(workspaceRoles)

            try {
                await sendInvitations(invites.value, workspaceId)
            } catch (e) {
                $logger.error('User invitations send failed: ', e)
                $accessor.banner.setBanner({
                    type: 'error',
                    value: true,
                    message: 'Sending User invitations failed. Please contact support or try again',
                })
            } finally {
                buttonLoading.value = false
            }
        }

        function _replaceRoleIDs(roles: Role[]) {
            for (const invite of invites.value) {
                const currentRole = roles.find((x) => x.name === invite.role)
                if (currentRole) invite.roleId = currentRole.id
            }
        }

        return {
            currentWorkspaceTemp,
            visibilitiesOptions,
            selectedVisibility,
            roles,
            invites,
            buttonLoading,
            createWorkspaceModelAttributes,
            createWorkspace,
            editWorkspace,
            setCurrentWorkspace,
            cancelWorkspace,
            addInvite,
            removeInvite,
        }
    },
    created() {
        this.setCurrentWorkspace()
    },
})
</script>
