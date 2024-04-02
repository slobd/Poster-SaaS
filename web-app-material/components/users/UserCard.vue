<template>
    <VCard height="140" class="elevation-2 tw-text-left">
        <VListItem three-line>
            <VListItemContent>
                <small
                    v-if="user.currentPosition"
                    class="tw-text-primary tw-truncate tw-whitespace-nowrap tw-text-ellipsis"
                    >{{ user.currentPosition }}</small
                >
                <VListItemTitle class="text-h6 tw-leading-none">
                    {{ user.firstName }} {{ user.lastName }}
                </VListItemTitle>
                <p class="tw-text-sm tw-truncate tw-whitespace-nowrap tw-text-ellipsis">
                    {{ user.organizationName }}
                </p>
                <div>
                    <VChip
                        v-if="position"
                        color="green lighten-5"
                        class="tw-mr-1 tw-mb-1 tw-rounded-xl"
                        x-small
                    >
                        {{ position }}
                    </VChip>
                </div>
            </VListItemContent>

            <ProfileImage :user="user" :size="56" />
        </VListItem>

        <div class="tw-flex tw-items-center tw-mb-3 tw-px-3">
            <VBtn
                :to="`/workspace/${$route.params.workspaceId}/users/${user.id}/profile`"
                outlined
                rounded
                text
                small
                class="tw-no-underline tw-tracking-normal tw-px-5 tw-mr-1"
            >
                profile
            </VBtn>
            <VBtn icon @click="isContactFormVisible = true">
                <FontAwesomeIcon class="tw-text-xl tw-text-gray-500" :icon="icons.faEnvelope" />
            </VBtn>
            <VTooltip bottom>
                <template #activator="{ on, attrs }">
                    <VBtn
                        v-if="user.linkedin"
                        icon
                        :href="user.linkedin"
                        target="_blank"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <FontAwesomeIcon
                            class="tw-text-xl tw-text-gray-500"
                            :icon="icons.faLinkedin"
                        />
                    </VBtn>
                </template>
                <span>linkedin</span>
            </VTooltip>
            <VTooltip bottom>
                <template #activator="{ on, attrs }">
                    <VBtn
                        v-if="user.researchGate"
                        icon
                        :href="user.researchGate"
                        target="_blank"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <FontAwesomeIcon
                            class="tw-text-xl tw-text-gray-500"
                            :icon="icons.faResearchgate"
                        />
                    </VBtn>
                </template>
                <span>researchGate</span>
            </VTooltip>
            <VTooltip bottom>
                <template #activator="{ on, attrs }">
                    <VBtn
                        v-if="user.twitter"
                        icon
                        :href="user.twitter"
                        target="_blank"
                        v-bind="attrs"
                        v-on="on"
                    >
                        <FontAwesomeIcon
                            class="tw-text-xl tw-text-gray-500"
                            :icon="icons.faTwitter"
                        />
                    </VBtn>
                </template>
                <span>twitter</span>
            </VTooltip>
        </div>

        <VDialog v-model="isContactFormVisible" max-width="660px" persistent>
            <!-- transition component help to keep leave transition before child is destroyed -->
            <transition :duration="150">
                <UserContactForm
                    v-if="isContactFormVisible"
                    :target-user="user"
                    @closeModal="isContactFormVisible = false"
                />
            </transition>
        </VDialog>
    </VCard>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from '@nuxtjs/composition-api'
import { faLinkedin, faResearchgate, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/pro-solid-svg-icons'
import { IExpert } from '~/types/experts'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'UserCard',
    props: {
        user: {
            type: Object as PropType<IExpert>,
            required: true,
        },
        position: {
            type: String,
            default: '',
        },
    },
    setup() {
        const { icons } = useIcons({
            faLinkedin,
            faResearchgate,
            faTwitter,
            faEnvelope,
        })

        const isContactFormVisible = ref(false)

        return {
            icons,
            isContactFormVisible,
        }
    },
})
</script>

<style></style>
