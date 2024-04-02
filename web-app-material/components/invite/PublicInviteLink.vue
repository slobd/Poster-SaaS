<template>
    <div v-if="publicUrl && !isPrivateWorkspace">
        <div class="tw-flex tw-items-center tw-mb-6">
            <span>Share this link to invite people to the workspace</span>
            <VSwitch
                v-model="enablePublicInvite"
                inset
                label="Enabled"
                hide-details
                class="tw-mt-0 tw-ml-6"
                @change="enableOrDisableInvite"
            ></VSwitch>
        </div>
        <div class="tw-flex tw-justify-between">
            <VTextField :value="publicUrl" outlined dense disabled background-color="white" />

            <VBtn
                :color="button.color"
                class="tw-ml-6"
                depressed
                max-width=""
                :disabled="!enablePublicInvite"
                @click="copyUrl"
            >
                <VIcon small class="tw-mr-2"> {{ button.icon }}</VIcon>
                <span>{{ button.text }}</span>
            </VBtn>
        </div>
    </div>
</template>

<script>
import { computed, defineComponent, ref } from '@vue/composition-api'
import { onMounted, useContext } from '@nuxtjs/composition-api'
import { APIRoutesV2 } from '@/types/typing'
import { WorkspaceVisibilityEnum } from '~/types/entities/WorkspaceVisibility.entity'

export default defineComponent({
    name: 'PublicInviteLink',
    setup() {
        const publicUrl = ref('')
        const button = ref({
            icon: '',
            color: 'primary',
            text: 'COPY LINK',
        })
        const enablePublicInvite = ref(true)
        const inviteId = ref()
        const { $axios, $accessor, $logger } = useContext()

        onMounted(async () => {
            try {
                await _getWorkspaceInviteUrl()
            } catch (e) {
                $logger.error('error fetching workspace invite url: ', e)
            }
            button.value = {
                icon: '',
                color: 'primary',
                text: 'COPY LINK',
            }
        })

        const isPrivateWorkspace = computed(() => {
            return (
                $accessor.workspace.getDefaultWorkspace.visibility ===
                WorkspaceVisibilityEnum.PRIVATE
            )
        })

        async function _getWorkspaceInviteUrl() {
            const invite = await $axios.$get(APIRoutesV2.IAM__INVITE__PUBLIC_INVITE, {
                params: {
                    workspaceId: $accessor.workspace.getWorkspaceId,
                },
            })

            if (invite) {
                inviteId.value = invite.id
                enablePublicInvite.value = invite.enabled
                publicUrl.value = `${$accessor.tenant.getHost}/auth/login?token=${invite.token}`
            }
        }

        function copyUrl() {
            try {
                navigator.clipboard.writeText(publicUrl.value)
                button.value = {
                    icon: 'mdi-check',
                    color: 'tw-bg-green-500',
                    text: 'COPIED',
                }
                setTimeout(function () {
                    button.value = {
                        icon: '',
                        color: 'primary',
                        text: 'COPY LINK',
                    }
                }, 1000)
            } catch (e) {}
        }

        async function enableOrDisableInvite() {
            try {
                await $axios.$patch(APIRoutesV2.IAM__INVITE__ID(inviteId.value), {
                    enabled: enablePublicInvite.value,
                    workspaceId: $accessor.workspace.getWorkspaceId,
                })
            } catch (e) {
                $logger.error('error while updating public invite status: ', e)
            }
        }

        return {
            publicUrl,
            button,
            enablePublicInvite,
            isPrivateWorkspace,
            copyUrl,
            enableOrDisableInvite,
        }
    },
})
</script>

<style scoped></style>
