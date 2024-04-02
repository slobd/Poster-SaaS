<template>
    <VRow>
        <VCol v-for="(user, i) in users" :key="i" cols="12" md="6">
            <UserCard :user="user" />
        </VCol>
    </VRow>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { User } from '~/types/entities/User.entity'

export default defineComponent({
    name: 'GalleryAuthorsGrid',
    props: {
        users: {
            type: Array as PropType<User[]>,
            default: () => [] as User[],
            required: true,
        },
    },
})
</script>

<style></style>
