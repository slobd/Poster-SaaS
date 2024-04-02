<template>
    <PolicyEnforcer
        v-if="$auth.loggedIn || true"
        v-slot="{ allow }"
        :permission="{
            resource: 'ROLE',
            action: 'ADMIN',
        }"
    >
        <VRow v-if="allow !== null" data-cy="Invite" dense>
            <VCol cols="12" :sm="isLinkActive ? '9' : '6'">
                <VTextField
                    :value="inviteLink"
                    :placeholder="inviteLink"
                    class="tw--mb-1"
                    filled
                    dense
                    disabled
                    :readonly="!isLinkActive"
                />
            </VCol>
            <VCol v-if="!isLinkActive" cols="12" sm="3">
                <VBtn
                    v-if="!isLinkActive"
                    tooltip="Activate link"
                    :color="color"
                    :disabled="!allow"
                    large
                    @click.prevent="handleInvitationLinkActivation"
                >
                    <FontAwesomeIcon :icon="icons.faUnlock" size="lg" fixed-width class="tw-pr-2" />
                    Activate Link
                </VBtn>
            </VCol>
            <VCol cols="12" sm="3">
                <VBtn
                    :color="color"
                    :disabled="!allow || !isLinkActive"
                    large
                    @click.prevent="copyLink(inviteLink)"
                >
                    <FontAwesomeIcon :icon="icons[icon]" size="lg" fixed-width class="tw-pr-2" />

                    {{ icon === 'faCheck' ? 'Link copied' : 'Copy link' }}
                </VBtn>
            </VCol>
            <VCol cols="12">
                <p class="tw-text-center">or</p>
            </VCol>
        </VRow>
    </PolicyEnforcer>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faUnlock, faCheck, faCopy } from '@fortawesome/pro-regular-svg-icons'
import { InviteToken } from '~/types/entities/Invite-token.entity'
import { APIRoutes } from '~/types/typing'

export default Vue.extend({
    components: { FontAwesomeIcon },

    data() {
        return {
            // Structure: https://worspacename.posterlab.co/?invite=token
            inviteLink: '',
            color: 'primary',
            icon: 'faCopy',
            isLinkActive: false,
            invite: null as unknown as InviteToken,
        }
    },
    async fetch(): Promise<void> {
        try {
            const invite = await this.$axios.$get<InviteToken>(APIRoutes.IAM_INVITE_LINK)

            if (invite.active) this.inviteLink = `${invite.tenant?.host}/?invite=${invite.token}`

            if (!invite.active) {
                this.inviteLink = '************************************************************'

                this.$accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: 'default',
                    message: 'Share link not active. To use it, please activate it.',
                })
            }
            this.isLinkActive = invite.active
            this.invite = invite
        } catch (error) {
            this.inviteLink = ''
        }
    },
    computed: {
        ...mapGetters('tenant', ['getTenantDefaultOrigin']),

        icons(): Record<string, IconDefinition> {
            return { faUnlock, faCheck, faCopy }
        },
    },
    methods: {
        copyLink(link: string) {
            if (!navigator.clipboard) {
                return
            }
            navigator.clipboard.writeText(link).then(() => {
                this.color = 'success'
                this.icon = 'faCheck'
            })
            const timeout = setTimeout(() => {
                this.color = 'primary'
                this.icon = 'faCopy'
                clearTimeout(timeout)
            }, 1000)
        },

        submitError() {
            this.$accessor.banner.setBanner({
                type: 'error',
                message:
                    'There was and error while activating the link. Please try again or contact administrator',
                value: true,
            })
        },

        async handleInvitationLinkActivation() {
            if (!this.invite?.token) return this.submitError()

            try {
                await this.$axios.$patch(APIRoutes.IAM_INVITE_LINK, {
                    token: this.invite.token,
                    active: true,
                } as InviteToken)
                this.$accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: 'success',
                    message: 'Invitation link successfully activated',
                })

                await this.$fetch()
            } catch (error) {
                this.$logger.error('[Error:invite] handleInvitationLinkActivation ', error)
                this.submitError()
            }
        },
    },
})
</script>
