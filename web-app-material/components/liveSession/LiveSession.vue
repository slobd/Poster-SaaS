<template>
    <div class="tw-h-full tw-flex tw-flex-col tw-overflow-y-auto">
        <VContainer fluid tw-h-auto>
            <div class="h-5">
                <h1 class="tw-text-lg sm:tw-text-2xl">{{ title }}</h1>
                <VSpacer />
            </div>
        </VContainer>
        <VDivider />
        <VContainer v-if="showFrame" fluid class="tw-h-full">
            <VRow no-gutters class="tw-h-full">
                <div id="jaas-container" class="tw-h-full tw-w-full" />
            </VRow>
            <VContainer v-if="loading">
                <loader></loader>
            </VContainer>
        </VContainer>
        // if there is an error
        <p v-if="error" class="error">{{ error }}</p>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import loader from './loader.vue'
import { APIRoutes } from '~/types/typing'
import { LiveSession } from '~/pages/live-session/index.vue'

export default Vue.extend({
    components: { loader },
    data() {
        return {
            appId: process.env.jitsiAppId,
            containerId: 'jaas-container',
            token: '',
            session: null as null | LiveSession,
            loading: true,
            showFrame: false,
            error: '',
            isModerator: false,
        }
    },
    computed: {
        title(): string | null {
            return this.session?.roomName || null
        },
    },
    async mounted() {
        try {
            const response = await this.$axios.$post(APIRoutes.LIVESESSION + '/generate-token', {
                slug: this.$route.params.room,
                user: this.$auth.user,
            })
            this.loading = false
            this.showFrame = true
            this.session = response.data.session
            this.isModerator = response.data.isModerator
            this.token = response.data.token
            const jitsiScript = document.createElement('script')
            jitsiScript.setAttribute('src', 'https://8x8.vc/libs/external_api.min.js')
            document.head.appendChild(jitsiScript)
            jitsiScript.onload = () => {
                this.initializeJitsi()
            }
            return
        } catch (e) {
            this.error = 'Some error occured'
            this.loading = false
        }
    },
    methods: {
        leave(api) {
            api.dispose()
            this.$router.push(APIRoutes.LIVESESSION)
        },
        initializeJitsi() {
            const jitsiOptions = {
                roomName: process.env.jitsiAppId + '/' + this.$route.params.room,
                parentNode: this.getJitsiRootNode(),
                configOverwrite: {
                    disableInviteFunctions: true,
                    startAudioMuted: 0,
                    remoteVideoMenu: {
                        disableKick: true,
                    },
                },
                jwt: this.token,
            }
            const api = new JitsiMeetExternalAPI('8x8.vc', jitsiOptions)

            /**
             * List of available buttons:
             * @see https://github.com/jitsi/jitsi-meet/blob/master/config.js
             * (search for "toolbarButtons")
             */
            const defaultButtons = ['chat', 'camera', 'microphone', 'hangup', 'desktop']

            const moderatorButtons = [
                ...defaultButtons,
                'security',
                'mute-everyone',
                'mute-video-everyone',
                'participants-pane',
            ]

            api.executeCommand('overwriteConfig', {
                toolbarButtons: defaultButtons,
                disableInviteFunctions: true,
            })
            api.executeCommand('toggleLobby', true)

            api.addEventListener('videoConferenceLeft', () => {
                this.leave(api)
            })

            api.addEventListener('participantRoleChanged', (event: { role: string }) => {
                if (event.role === 'moderator') {
                    api.executeCommand('toggleLobby', true)
                    api.executeCommand('overwriteConfig', {
                        toolbarButtons: moderatorButtons,
                        remoteVideoMenu: {
                            disableKick: false,
                        },
                    })
                }
            })
        },
        getJitsiRootNode() {
            const node = document.getElementById(this.containerId)
            if (!node) {
                throw new Error(`Did not find expected root node`)
            }
            return node
        },
    },
})
</script>
<style></style>
