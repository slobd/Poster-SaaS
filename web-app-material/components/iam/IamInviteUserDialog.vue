<template>
    <VDialog v-model="dialog" max-width="800px">
        <template #activator="{ on, attrs }">
            <slot name="activator" v-bind="{ on, attrs }"></slot>
        </template>
        <ValidationObserver v-slot="{ handleSubmit, valid }" slim>
            <VCard>
                <VContainer>
                    <VCardTitle class="justify-center d-flex">
                        <span class="text-h5">Invite new users</span>
                    </VCardTitle>
                    <VCardActions>
                        <VContainer>
                            <VRow>
                                <p class="pl-3">{{ inviteTitle }}</p>
                            </VRow>
                            <IamInvitationLink />
                            <div v-if="!invitationSent">
                                <VRow v-for="(user, index) in users" :key="index" dense>
                                    <VCol cols="12" sm="6" align-self="center">
                                        <ValidationProvider
                                            v-slot="{ errors }"
                                            :name="`email ${index + 1}`"
                                            mode="aggressive"
                                            rules="email|required"
                                            slim
                                        >
                                            <VTextField
                                                :value="user.email"
                                                :error-messages="errors"
                                                label="Email"
                                                @input="
                                                    (value) =>
                                                        updateUser({
                                                            index,
                                                            key: 'email',
                                                            value,
                                                        })
                                                "
                                            />
                                        </ValidationProvider>
                                    </VCol>
                                    <VCol cols="12" sm="5" align-self="center">
                                        <ValidationProvider
                                            v-slot="{ errors }"
                                            :name="`role ${index + 1}`"
                                            mode="eager"
                                            rules="required"
                                            slim
                                        >
                                            <VSelect
                                                :value="user.role"
                                                label="Select Roles"
                                                :items="roleSelectItems"
                                                :error-messages="errors"
                                                @change="
                                                    (value) =>
                                                        updateUser({
                                                            index,
                                                            key: 'role',
                                                            value,
                                                        })
                                                "
                                            ></VSelect>
                                        </ValidationProvider>
                                    </VCol>
                                    <VCol cols="12" sm="1" align-self="center">
                                        <VBtn
                                            v-if="users.length - 1"
                                            icon
                                            @click.prevent="removeUser({ index })"
                                        >
                                            <FontAwesomeIcon :icon="icons.faTimes" size="lg" />
                                        </VBtn>
                                    </VCol>
                                </VRow>
                                <VBtn color="primary" text @click.prevent="addUser()">
                                    <FontAwesomeIcon
                                        :icon="icons.faUserPlus"
                                        size="lg"
                                        fixed-width
                                        class="tw-pr-2"
                                    />
                                    Add User
                                </VBtn>
                                <VCol cols="12" class="justify-center d-flex">
                                    <VBtn
                                        :disabled="!valid"
                                        color="primary"
                                        @click.prevent="handleSubmit(sendInvitations)"
                                    >
                                        Send Invitations
                                    </VBtn>
                                </VCol>
                            </div>

                            <VRow v-else>
                                <VCol cols="12" class="justify-center d-flex">
                                    <FontAwesomeIcon
                                        :icon="icons.faCheck"
                                        size="3x"
                                        fixed-width
                                        class="tw-text-green-600"
                                    />
                                </VCol>
                                <VCol cols="12" class="justify-center d-flex">
                                    <p>Invitation sent successfully</p>
                                </VCol>
                                <VCol cols="12" class="justify-center d-flex">
                                    <VBtn color="primary" @click="closeDialog()">Close</VBtn>
                                    <VBtn color="primary" text @click.prevent="sendMoreInvitations"
                                        >Send more invitations
                                    </VBtn>
                                </VCol>
                            </VRow>
                        </VContainer>
                    </VCardActions>
                </VContainer>
            </VCard>
        </ValidationObserver>
    </VDialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapMutations } from 'vuex'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faUserPlus } from '@fortawesome/pro-solid-svg-icons'
import { faCheck, faTimes } from '@fortawesome/pro-regular-svg-icons'
import cloneDeep from 'lodash/cloneDeep'
import { APIRoutes } from '~/types/typing'

export default Vue.extend({
    components: { ValidationProvider, ValidationObserver, FontAwesomeIcon },

    data() {
        return {
            dialog: false,
            invitationSent: false,
        }
    },

    computed: {
        ...mapGetters('iam', ['getRoles']),
        ...mapGetters('user-management', { users: 'getUsersInviteList' }),

        icons(): Record<string, IconDefinition> {
            return {
                faUserPlus,
                faCheck,
                faTimes,
            }
        },

        inviteTitle(): string {
            return 'Invite as Workspace member share link'
        },

        roleSelectItems(): string[] {
            const items = (this.getRoles as any[])
                .map(({ name }) => name)
                .filter((r) => r !== 'GUEST')

            items.unshift({
                text: 'Select a role',
                value: '',
                disabled: true,
            })
            return items
        },
    },

    methods: {
        ...mapMutations('user-management', {
            setAskOnReload: 'setAskOnReload',
            addUser: 'addUser',
            removeUser: 'removeUser',
            updateUser: 'updateUser',
            resetState: 'resetState',
        }),

        async sendInvitations(): Promise<any> {
            const filteredUser = cloneDeep(this.users).map((user) => {
                if (user?.role) {
                    const role = this.getRoles.find(({ name }) => name === user.role)
                    if (role) user.role = role
                }

                return user
            })

            if (!filteredUser.length) return

            try {
                await this.$axios.$post(APIRoutes.IAM_INVITE_USERS, filteredUser)
                this.invitationSent = true
                this.resetState()
            } catch (error) {}
        },

        sendMoreInvitations() {
            this.invitationSent = false
        },

        closeDialog() {
            this.dialog = false

            this.invitationSent = false
        },
    },
})
</script>
