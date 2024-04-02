<template>
    <ValidationObserver
        ref="observer"
        class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-max-w-xs tw-mx-auto"
    >
        <VAvatar size="170" color="primary" class="mb-5">
            <img v-if="hasAvatar" :src="image" alt="" class="tw-object-cover" />
            <div v-else>
                <span class="white--text text-h4">{{ defaultAvatarLabel }}</span>
            </div>
        </VAvatar>
        <VeeFileInput
            :value="avatarFile"
            accept="image/jpg, image/jpeg"
            name="Avatar"
            vid="avatar"
            rules="size:3000|mimeType:image/jpeg,image/png"
            label="Browse file"
            hint="File format admitted: jpg or png. Max. 3MB"
            persistent-hint
            outlined
            clearable
            @change="handleUserAvatar"
        />
        <VBtn v-if="hasAvatar" text x-small @click="handleAvatarDeletion">Remove file</VBtn>
    </ValidationObserver>
</template>

<script lang="ts">
import { computed, ref, useContext, useFetch, nextTick } from '@nuxtjs/composition-api'
import { defineComponent } from '@vue/composition-api'
import { ValidationObserver } from 'vee-validate'
import { User } from '~/types/entities/User.entity'
import { FloatingBannerEnum } from '~/types/banner'

export default defineComponent({
    setup() {
        const avatarFile = ref()
        const image = ref()
        const avatarObserver = ref<InstanceType<typeof ValidationObserver> | null>(null)

        const { $auth, $accessor, $logger } = useContext()

        const hasAvatar = computed(() => {
            return !!$auth.user.avatar
        })

        useFetch(() => {
            if ($auth.user.avatar) {
                image.value = $auth.user.avatar.location
            }
        })

        const defaultAvatarLabel = computed(() => {
            return $auth.user.firstName[0].toUpperCase() + $auth.user.lastName[0].toUpperCase()
        })
        async function handleUserAvatar(input) {
            if (!input) {
                avatarFile.value = null
                return
            }
            avatarFile.value = input
            await nextTick()
            const isValid = await avatarObserver.value!.validate()

            if (isValid && avatarObserver.value!.errors.avatar.length === 0) {
                try {
                    await $accessor.myprofile.updateProfile({
                        user: $auth.user,
                        avatar: input,
                    })

                    await $auth.fetchUser()
                    image.value = $auth.user?.avatar?.location

                    $accessor.banner.setBannerWithTimeout({
                        value: true,
                        type: FloatingBannerEnum.success,
                        message: 'Avatar successfully updated',
                    })
                } catch (error) {
                    $accessor.banner.setBanner({
                        type: FloatingBannerEnum.error,
                        message: 'There was and error while updating your avatar',
                        value: true,
                    })
                } finally {
                    avatarFile.value = null
                }
            }
        }

        async function handleAvatarDeletion() {
            try {
                await $accessor.myprofile.updateProfile({
                    user: {
                        avatar: null,
                    } as User,
                })

                await $auth.fetchUser()
                image.value = ''
                avatarFile.value = null
                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.success,
                    message: 'Avatar successfully deleted',
                })
                $logger.error('deleted avatar: ', avatarFile.value, typeof avatarFile.value)
            } catch (error) {
                $accessor.banner.setBannerWithTimeout({
                    type: FloatingBannerEnum.error,
                    message: 'There was and error while deleting your avatar',
                    value: true,
                })
            }
        }

        return {
            hasAvatar,
            avatarFile,
            image,
            defaultAvatarLabel,
            observer: avatarObserver,
            handleUserAvatar,
            handleAvatarDeletion,
        }
    },
})
</script>

<style></style>
