<template>
    <VDialog
        :value="$accessor.getInviteModal"
        transition="scroll-x-reverse-transition"
        max-width="50%"
        persistent
        :retain-focus="false"
        @input="$emit('input', $event)"
    >
        <VCard v-if="!invitationsSent" class="tw-pb-5">
            <VCardTitle class="tw-flex tw-items-center tw-justify-between tw-py-5">
                Invite to the Workspace
            </VCardTitle>
            <VDivider class="tw-pb-7"></VDivider>
            <VCard class="tw-bg-gray-100 tw-mx-5 tw-mb-0">
                <VCardText>
                    <PublicInviteLink />
                    <VDivider></VDivider>
                    <AddInviteUser :roles="roles" @add="addInvite" />
                    <ListInviteUser :roles="roles" :invites="invites" @remove="removeInvite" />
                </VCardText>
            </VCard>
            <VCardActions class="justify-end tw-mt-5">
                <VBtn text @click="$accessor.setInviteModal(false)">Cancel</VBtn>
                <VBtn
                    color="primary"
                    depressed
                    :disabled="disableButton"
                    :loading="buttonLoading"
                    @click="sendUserInvitations"
                >
                    Send Invitations
                </VBtn>
            </VCardActions>
        </VCard>

        <VCard v-else class="tw-pb-5">
            <VCardTitle class="tw-flex tw-items-center tw-justify-between tw-pt-9">
                Invite to the Workspace
            </VCardTitle>
            <VDivider></VDivider>
            <div class="text-center tw-my-5">
                <VIcon color="green" class="text-h2">mdi-check</VIcon>
            </div>

            <VCardText class="text-h6 text-center"> Your invitations have been sent. </VCardText>
            <VCardText class="text-subtitle-1 text-center">
                All people in your list will receive an email to register to your workspace.
            </VCardText>
            <VCardActions class="justify-center tw-mt-5">
                <VBtn text outlined @click="inviteMoreUsers">
                    <FontAwesomeIcon :icon="icons.faPlus" class="tw-mx-1" />
                    Invite More People
                </VBtn>
                <VBtn depressed @click="backButtonOnModalPressed">Back</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useFetch } from '@nuxtjs/composition-api'
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import AddInviteUser from '~/components/invite/AddInviteUser.vue'
import useUserInvite from '~/composables/experts/useUserInvite'
import useIcons from '~/composables/common/useIcons'
import { UserInvite } from '~/components/invite/ListInviteUser.vue'

export default defineComponent({
    name: 'InviteModal',
    components: { AddInviteUser },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const { $accessor, $logger } = useContext()
        const { roles, fetchRoles, sendInvitations } = useUserInvite()
        const { icons } = useIcons({ faPlus })

        const modalShow = ref(props.value)
        const invites = ref<UserInvite[]>([])
        const buttonLoading = ref(false)
        const invitationsSent = ref(false)
        const disableButton = computed(() => {
            return invites.value.length === 0
        })

        useFetch(async () => {
            await fetchRoles()
        })

        function addInvite(e) {
            if (invites.value.length <= 4) {
                if (invites.value.filter((x) => x.email === e.email).length === 0) {
                    invites.value.push(e)
                }
            } else
                $accessor.banner.setBanner({
                    value: true,
                    type: 'error',
                    message: 'Maximum user invite limit reach',
                })
        }
        function removeInvite(index) {
            invites.value.splice(index, 1)
        }

        async function sendUserInvitations() {
            if (invites.value.length > 0) {
                buttonLoading.value = true
                try {
                    await sendInvitations(
                        invites.value,
                        $accessor.workspace.getWorkspaceId as number
                    )
                    invitationsSent.value = true
                } catch (e) {
                    $logger.error('User invitations send failed: ', e)
                    $accessor.banner.setBanner({
                        type: 'error',
                        value: true,
                        message:
                            'Sending User invitations failed. Please contact support or try again',
                    })
                } finally {
                    buttonLoading.value = false
                }
            }
        }

        function inviteMoreUsers() {
            invitationsSent.value = false
            invites.value = []
        }

        function backButtonOnModalPressed() {
            invitationsSent.value = false
            invites.value = []
            $accessor.setInviteModal(false)
        }

        return {
            modalShow,
            invites,
            buttonLoading,
            invitationsSent,
            icons,
            roles,
            disableButton,
            addInvite,
            removeInvite,
            sendUserInvitations,
            inviteMoreUsers,
            backButtonOnModalPressed,
        }
    },
})
</script>

<style scoped></style>
