<template>
    <VCard>
        <header class="contact-form-header">
            <h1 class="tw-text-lg">Contact me</h1>
            <VBtn icon @click="$emit('closeModal')">
                <FontAwesomeIcon class="tw-text-xl tw-text-gray-500" :icon="icons.faTimes" />
            </VBtn>
        </header>

        <div v-if="!isMailSent" class="tw-grid tw-grid-cols-2 tw-gap-x-6 tw-px-12 tw-pt-4">
            <p class="tw-col-span-2 tw-text-sm tw-mb-8">
                This information will be sent by email to the user
            </p>
            <div class="tw-col-span-1">
                <VTextField
                    v-model="authUser.firstName"
                    label="Your First name"
                    outlined
                    dense
                    disabled
                ></VTextField>
            </div>
            <div class="tw-col-span-1">
                <VTextField
                    v-model="authUser.lastName"
                    label="Your Last name"
                    outlined
                    dense
                    disabled
                ></VTextField>
            </div>
            <div class="tw-col-span-1">
                <VTextField
                    v-model="authUser.organizationName"
                    label="Organization"
                    placeholder=""
                    persistent-placeholder
                    outlined
                    dense
                    disabled
                ></VTextField>
            </div>
            <div class="tw-col-span-1 tw-self-center tw-pb-7 tw-text-xs">
                Update your personal information in
                <NuxtLink :to="'/user-settings/profile'" class="tw-text-black"
                    >user settings</NuxtLink
                >
            </div>
            <div class="tw-col-span-2">
                <VTextarea
                    v-model="mailMessage"
                    label="Message"
                    placeholder="Your message here"
                    persistent-placeholder
                    outlined
                    dense
                    auto-grow
                    counter
                    :rules="[(v) => v.length <= 1000 || 'Max 1000 characters']"
                >
                </VTextarea>
            </div>
        </div>
        <div v-else class="tw-text-center tw-px-5 tw-py-10">
            <img :src="mailSentImage" alt="Mail sent" width="257" class="tw-mb-9" />
            <p class="tw-font-bold tw-mb-2">Your message has been sent.</p>
            <p class="tw-text-sm tw-mb-10">
                An email message will be sent to
                {{ targetUser.firstName }} {{ targetUser.lastName }}
            </p>
            <VBtn class="tw-px-4" outlined small @click="$emit('closeModal')"> Close </VBtn>
        </div>

        <footer v-if="!isMailSent" class="contact-form-footer">
            <VBtn class="tw-px-4" text small @click="$emit('closeModal')"> Cancel </VBtn>
            <VBtn
                class="tw-px-4 tw-ml-1"
                color="primary"
                small
                depressed
                :disabled="!mailMessage || mailMessage.length > 1000"
                @click="sendMessage()"
            >
                <FontAwesomeIcon class="tw-mr-2" :icon="icons.faEnvelope" />
                Send
            </VBtn>
        </footer>
    </VCard>
</template>

<script lang="ts">
import { defineComponent, PropType, useContext, ref } from '@nuxtjs/composition-api'
import { faTimes } from '@fortawesome/pro-light-svg-icons'
import { faEnvelope } from '@fortawesome/pro-solid-svg-icons'
import { APIRoutesV2 } from '~/types/typing'
import useIcons from '~/composables/common/useIcons'
import { User } from '~/sdk'

export default defineComponent({
    name: 'UserContactForm',
    props: {
        targetUser: {
            type: Object as PropType<User>,
            required: true,
        },
    },
    setup(props) {
        const { $auth, $accessor, $axios, $logger } = useContext()
        const { icons } = useIcons({ faTimes, faEnvelope })

        const authUser = $auth.user
        const mailSentImage = require('~/assets/img/email-sent.svg')

        const mailMessage = ref('')
        const isMailSent = ref(false)

        async function sendMessage() {
            try {
                await $axios.$post(
                    APIRoutesV2.WORKSPACES_ID_MESSAGE_ID(
                        $accessor.workspace.getWorkspaceId,
                        props.targetUser.id
                    ),
                    {
                        message: mailMessage.value,
                    }
                )
                isMailSent.value = true
            } catch (error) {
                $logger.error(error)
            }
        }

        return {
            icons,
            authUser,
            mailSentImage,
            isMailSent,
            mailMessage,
            sendMessage,
        }
    },
})
</script>

<style scoped>
.contact-form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 68px;
    border-bottom: 1px solid #e0e0e0;
    @apply tw-px-6;
}

.contact-form-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 68px;
    border-top: 1px solid #e0e0e0;
    @apply tw-px-12;
}
</style>
