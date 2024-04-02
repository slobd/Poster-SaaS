<template>
    <div class="tw-h-full tw-w-full">
        <LiveSession v-click-outside="clockEvent" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    data() {
        return {
            title: this.$route.params.room,
        }
    },
    fetch() {
        this.$accessor.setCurrentLiveSession(this.$route.params.room)
    },
    methods: {
        clockEvent() {
            const roomName = this.$accessor.getCurrentLiveSession

            if (!confirm('Do you wish to exit the live session?')) {
                this.$router.push({ path: `/live-session/${roomName}` })
            }
        },
    },
})
</script>
