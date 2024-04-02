<template>
    <div class="tw-flex">
        <VMenu offset-y offset-x transition="slide-x-transition">
            <template #activator="{ on, attrs }">
                <VBtn v-bind="attrs" icon class="tw-mr-6 tw-ml-1 tw-mb-1" v-on="on">
                    <ProfileImage :user="$auth.user" :size="imageSize.lg" />
                </VBtn>
            </template>
            <VCard class="mx-auto" max-width="400">
                <VList>
                    <VListItemGroup active-class="border" color="indigo darken-4">
                        <VListItem active-class="border" @click="myProfile">
                            <VListItemAction class="tw-mr-3">
                                <FontAwesomeIcon :icon="icons.faUserCircle" size="lg" fixed-width />
                            </VListItemAction>
                            <VListItemContent>
                                <VListItemTitle v-text="'User Settings'" />
                            </VListItemContent>
                        </VListItem>
                        <VListItem active-class="border" :href="helpAndSupportUrl" target="_blank">
                            <VListItemAction class="tw-mr-3">
                                <FontAwesomeIcon :icon="icons.faQuestion" size="lg" fixed-width />
                            </VListItemAction>
                            <VListItemContent>
                                <VListItemTitle v-text="'Help & support'" />
                            </VListItemContent>
                        </VListItem>
                        <VListItem active-class="border" @click="logout">
                            <VListItemAction class="tw-mr-3">
                                <FontAwesomeIcon :icon="icons.faSignOutAlt" size="lg" fixed-width />
                            </VListItemAction>
                            <VListItemContent>
                                <VListItemTitle v-text="'Logout'" />
                            </VListItemContent>
                        </VListItem>
                    </VListItemGroup>
                </VList>
            </VCard>
        </VMenu>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useRouter } from '@nuxtjs/composition-api'
import { faSignOutAlt, faUserCircle, faQuestion } from '@fortawesome/pro-solid-svg-icons'
import { ProfileImageSizeEnum } from '~/types/profileImageSize'
import { User } from '~/types/entities/User.entity'
import useIcons from '~/composables/common/useIcons'
import useAuthUtil from '~/composables/common/useAuthUtil'

export default defineComponent({
    setup() {
        const { $auth } = useContext()
        const router = useRouter()

        const { icons } = useIcons({
            faUserCircle,
            faSignOutAlt,
            faQuestion,
        })
        const { logout } = useAuthUtil()
        const imageSize = ref(ProfileImageSizeEnum)

        const user: User = $auth.user

        const helpAndSupportUrl = process.env.helpAndSupport

        function myProfile(): void {
            router.push('/user-settings/profile')
        }
        const isAttendee = computed(() => {
            const user = $auth.user.roles?.filter((x) => x.name === 'ATTENDEE')

            return !!(user && user.length > 0)
        })

        return { imageSize, icons, user, helpAndSupportUrl, logout, myProfile, isAttendee }
    },
})
</script>
