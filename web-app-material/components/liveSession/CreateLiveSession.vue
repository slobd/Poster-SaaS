<template>
    <VContainer>
        <VRow>
            <VCol fill-height class="tw-py-4 tw-mx-10">
                <div>
                    <span class="tw-text-sm">Title</span>
                </div>
                <VeeTextField
                    v-model="roomName"
                    rules="required"
                    label="Insert the title of the new session"
                    vid="roomName"
                    class="tw-mb-9"
                    hide-details="auto"
                    required
                    outlined
                />
                <div class="tw-flex tw-flex tw-justify-center tw-items-center">
                    <VBtn :loading="buttonLoading" color="primary" @click="submit">Start Now</VBtn>
                </div>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script lang="ts">
import { defineComponent, ref, useContext, useRouter } from '@nuxtjs/composition-api'
import { FloatingBannerEnum } from '~/types/banner'
import { APIRoutes } from '~/types/typing'

export default defineComponent({
    setup() {
        const roomName = ref('')
        const buttonLoading = ref(false)

        const { $axios, $auth, $accessor } = useContext()
        const router = useRouter()

        async function submit() {
            buttonLoading.value = true
            if (roomName.value === '') {
                buttonLoading.value = false
                return
            }
            try {
                const response = await $axios.$post(APIRoutes.LIVESESSION, {
                    roomName: roomName.value,
                    user: $auth.user,
                })
                if (response.status === 'failed') {
                    $accessor.banner.setBannerWithTimeout({
                        value: true,
                        type: FloatingBannerEnum.error,
                        message: 'Session cannot be started. Please contact support',
                    })
                    buttonLoading.value = false
                    return
                }
                router.push({ path: '/live-session/' + response.data.slug })
            } catch (e) {
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.error,
                    message: 'Session cannot be started. Please contact support',
                })
                buttonLoading.value = false
            }
        }

        return {
            buttonLoading,
            roomName,
            submit,
        }
    },
})
</script>

<style></style>
