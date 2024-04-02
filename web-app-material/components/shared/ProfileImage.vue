<template>
    <VAvatar :color="background" :size="size">
        <img
            v-if="user && user.avatar"
            class="tw-object-cover"
            :src="user.avatar.location"
            alt="user"
        />
        <span v-else class="white--text tw-leading-none">
            {{ initials }}
        </span>
    </VAvatar>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
    name: '',
    props: {
        user: {
            type: Object,
            default: () => {
                return { firstName: 'Poster', lastName: 'Lab', avatar: '' }
            },
        },
        size: {
            type: Number,
            default: 40,
        },
    },

    computed: {
        initials(): string {
            if (this.user?.firstName)
                return `${this.user?.firstName[0].toUpperCase()}${this.user?.lastName[0].toUpperCase()}`
            return 'PL'
        },
        background(): string {
            const firstName = this.user?.firstName
            const lastName = this.user?.lastName

            let hash: number = 0
            const fullName: string = `${firstName} ${lastName}`
            const saturation: number = 30
            const lightness: number = 80
            for (let i = 0; i < fullName.length; i++) {
                hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
            }
            const hue: number = hash % 360
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`
        },
    },
    methods: {},
})
</script>

<style></style>
