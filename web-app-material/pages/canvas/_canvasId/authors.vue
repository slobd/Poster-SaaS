<template>
    <div>
        <CanvasIdHeader> Authors and Affiliations (max. 5) </CanvasIdHeader>
        <div class="tw-grid tw-grid-cols-1 tw-gap-3 sm:tw-grid-cols-2 lg:tw-grid-cols-5">
            <div class="tw-col-span-1 tw-bg-white">
                <CanvasSearchUser :users-to-filter="authors" @user="handleUserAuthor" />
            </div>
            <div class="tw-col-span-4 tw-bg-white">
                <CanvasAddUser @user="handleNewUserInvitation" />
            </div>
        </div>
        <div
            class="
                tw-shadow tw-overflow-hidden tw-border-b tw-border-gray-200
                sm:tw-rounded-lg
                tw-mt-4
            "
        >
            <CanvasUsersTable :users="authors" @deleteAction="handleAuthorDeletion" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapMutations } from 'vuex'
import { User } from '~/types/entities/User.entity'

export default Vue.extend({
    name: 'CanvasAuthorsPage',
    computed: {
        ...mapGetters('canvas', {
            authors: 'getAuthors',
        }),
    },
    mounted() {
        this.setAskOnReload()
    },
    methods: {
        ...mapMutations('canvas', {
            setAskOnReload: 'setAskOnReload',
            addAuthor: 'addAuthor',
            removeAuthor: 'removeAuthor',
            updateAuthor: 'updateAuthor',
        }),
        handleNewUserInvitation(person): void {
            if (person) this.addAuthor(person)
        },
        handleAuthorDeletion(index: number): void {
            this.removeAuthor({ index })
        },
        handleUserAuthor(user: User): void {
            this.addAuthor(user)
        },
    },
})
</script>
