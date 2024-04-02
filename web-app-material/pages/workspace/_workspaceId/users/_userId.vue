<template>
    <div class="grey lighten-4 tw-h-full tw-px-10 tw-py-3">
        <UserRequestCollaborationModal
            v-if="showRequestCollaborationModal && user"
            :input="showRequestCollaborationModal"
            :user="user"
            @close="showRequestCollaborationModal = false"
        />
        <div class="tw-flex tw-items-center">
            <ProfileImage :user="user" :size="40" />
            <div class="tw-ml-2">
                <h3 class="tw-font-medium tw-text-xl tw-leading-6">
                    {{ user && user.firstName }} {{ user && user.lastName }}
                </h3>
            </div>

            <VSpacer />
            <VBtn text>
                <nuxt-link
                    :to="`/workspace/${$route.params.workspaceId}/users`"
                    class="grey--text text--darken-3 tw-text-base tw-normal-case tw-no-underline"
                >
                    <FontAwesomeIcon :icon="icons.faArrowLeft" />
                    People
                </nuxt-link>
            </VBtn>
        </div>

        <VCard class="white tw-mt-4 tw-flex tw-px-3 tw-py-2 tw-items-center tw-justify-center">
            <div>
                <VTabs>
                    <VTab
                        :to="`/workspace/${params.workspaceId}/users/${params.userId}/profile`"
                        active-class="white"
                    >
                        <p class="tw-mb-0 tw-ml-2">Profile info</p>
                    </VTab>
                    <VTab
                        :to="`/workspace/${params.workspaceId}/users/${params.userId}/related-experts`"
                        active-class="white"
                    >
                        <p class="tw-mb-0 tw-ml-2">Related People</p>
                    </VTab>
                </VTabs>
            </div>

            <VSpacer />
            <VBtn
                class="tw-px-4"
                color="primary"
                small
                depressed
                @click="isContactFormVisible = true"
            >
                <FontAwesomeIcon class="tw-mr-2" :icon="icons.faEnvelope" />
                Contact me
            </VBtn>
            <!--<div>
                <VTabs>
                    <VBtn
                        color="primary"
                        class="tw-mt-2"
                        @click="showRequestCollaborationModal = true"
                    >
                        Request Collaboration
                    </VBtn>
                </VTabs>
            </div>-->
        </VCard>
        <div class="tw-grid tw-grid-cols-12 tw-gap-x-2 tw-pt-5">
            <div class="tw-col-span-4 lg:tw-col-span-3">
                <UserInfo :user="userInfo" />
            </div>
            <div class="tw-col-span-8 lg:tw-col-span-9">
                <NuxtChild :user="userInfo" />
            </div>
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
    </div>
</template>

<script lang="ts">
import { defineComponent, useFetch, ref, computed, useRoute } from '@nuxtjs/composition-api'
import { faArrowLeft, faEnvelope } from '@fortawesome/pro-solid-svg-icons'
import { ProfileImageSizeEnum } from '~/types/profileImageSize'
import useIcons from '~/composables/common/useIcons'
import useExpert from '~/composables/experts/useExpert'

export default defineComponent({
    setup() {
        const { icons } = useIcons({ faArrowLeft, faEnvelope })
        const { user, fetchUser } = useExpert()
        const params = useRoute().value.params

        const imageSize = ref(ProfileImageSizeEnum)
        const showRequestCollaborationModal = ref(false)
        const isContactFormVisible = ref(false)

        useFetch(async () => {
            await fetchUser()
        })

        // Computed
        const userInfo = computed(() => {
            return user.value
        })
        return {
            icons,
            user,
            imageSize,
            showRequestCollaborationModal,
            isContactFormVisible,
            params,
            userInfo,
        }
    },
})
</script>
