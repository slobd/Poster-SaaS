<template>
    <div class="tw-flex">
        <VMenu offset-y offset-x transition="slide-x-transition">
            <template #activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                    <ProfileImage :user="$auth.user" :size="40" />
                </span>
            </template>
            <VCard class="mx-auto" max-width="400">
                <VList>
                    <VListItemGroup active-class="border" color="indigo darken-4">
                        <VListItem active-class="border" @click="myProfile">
                            <VListItemAction class="tw-mr-3">
                                <FontAwesomeIcon :icon="icons.faUserCircle" size="lg" fixed-width />
                            </VListItemAction>
                            <VListItemContent>
                                <VListItemTitle v-text="'User settings'" />
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
import { defineComponent, ref, useRouter } from '@nuxtjs/composition-api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faQuestion, faSignOutAlt, faUserCircle } from '@fortawesome/pro-solid-svg-icons'
import { ProfileImageSizeEnum } from '~/types/profileImageSize'
import useIcons from '~/composables/common/useIcons'
import useAuthUtil from '~/composables/common/useAuthUtil'

export default defineComponent({
    components: {
        FontAwesomeIcon,
    },
    setup() {
        const router = useRouter()
        const { icons } = useIcons({
            faUserCircle,
            faSignOutAlt,
            faQuestion,
        })
        const { logout } = useAuthUtil()

        const imageSize = ref(ProfileImageSizeEnum)

        const helpAndSupportUrl = process.env.helpAndSupport

        function myProfile(): void {
            router.push('/user-settings/profile')
        }

        return { imageSize, icons, helpAndSupportUrl, logout, myProfile }
    },
})
</script>
