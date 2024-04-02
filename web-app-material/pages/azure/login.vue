<template>
    <VContainer>
        <VRow v-if="!loggedIn">
            <h3 class="tw-my-10 tw-mx-0">User Login</h3>
            <VCol cols="12">
                <!-- <VBtn
                    color="primary"
					href="https://posterlabapp.b2clogin.com/posterlabapp.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_pl_demo&client_id=4664ae35-4e3d-4b6f-95d8-07d4982304e2&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fazure%2Flogin&scope=openid&response_type=id_token&prompt=login"
                    >Click to login via SS0</VBtn
                > -->
                <VBtn
                    color="primary"
                    href="https://posterlabapp.b2clogin.com/posterlabapp.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_SIGNUP_SIGNIN&client_id=ca703a6d-ae4b-49a4-bb5f-8ac06924d43b&nonce=defaultNonce&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fazure%2Flogin&scope=openid&response_type=code&prompt=login"
                    >Click to login via SS0
                </VBtn>
            </VCol>
        </VRow>
        <VRow v-if="loggedIn && userInfo" class="tw-mt-10">
            <h3>User Info</h3>
            <VCol cols="12">
                <span>Username: {{ userInfo.given_name }} {{ userInfo.family_name }} </span>
            </VCol>
            <VCol v-if="userInfo.email || userInfo.emails" cols="12">
                <span>email: {{ userInfo.email || userInfo.emails[0] }} </span>
            </VCol>
            <VCol v-if="userInfo.sub" cols="12">
                <span>user id: {{ userInfo.sub }} </span>
            </VCol>
            <VCol v-if="userInfo.newUser">
                <span>Users first login</span>
            </VCol>
            <VCol v-if="userInfo.idp">
                <span>Identity provider: {{ userInfo.idp }}</span>
            </VCol>
            <VCol v-if="idToken">
                <span>Bearer token: {{ idToken }}</span>
            </VCol>
            <VCol>
                {{ userInfo }}
            </VCol>
        </VRow>
    </VContainer>
</template>

<script lang="ts">
import { useContext, useRoute } from '@nuxtjs/composition-api'
import { defineComponent, onMounted, ref } from '@vue/composition-api'

interface UserInfo {
    // eslint-disable-next-line camelcase
    given_name: string
    // eslint-disable-next-line camelcase
    family_name: string
    emails: string[]
    email: string
    newUser: boolean
    idp: string
    sub: string
}

export default defineComponent({
    auth: false,
    setup() {
        const route = useRoute()
        const { $logger, $axios } = useContext()
        const userInfo = ref<UserInfo>()
        const loggedIn = ref(false)
        const idToken = ref('')

        function parseJwt(token) {
            const base64Payload = token.split('.')[1]
            const payload = Buffer.from(base64Payload, 'base64')
            return JSON.parse(payload.toString())
        }

        onMounted(async () => {
            const url = route.value.fullPath
            $logger.error('url: ', url)

            if (url.includes('?code=')) {
                const authorizationCode = route.value.query.code
                $logger.error('authorization_code: ', authorizationCode)
                const baseUrl =
                    'https://posterlabapp.b2clogin.com/posterlabapp.onmicrosoft.com/B2C_1A_SIGNUP_SIGNIN/oauth2/v2.0/token'
                const config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }

                const qs = require('qs')
                const data = qs.stringify({
                    client_id: 'ca703a6d-ae4b-49a4-bb5f-8ac06924d43b',
                    grant_type: 'authorization_code',
                    scope: ' openid offline_access https://graph.microsoft.com/.default',
                    code: authorizationCode,
                    client_secret: '4oH7Q~HtiyJSk5e_RfLe9cAHZEiiXUpP9gSwN',
                    redirect_uri:
                        'https://posterlabapp.b2clogin.com/posterlabapp.onmicrosoft.com/oauth2/authresp',
                })
                const response = await $axios.$post(baseUrl, { data }, config)
                $logger.error('response: ', response)
                idToken.value = response.id_token
                userInfo.value = parseJwt(response.id_token)
                $logger.error('userInfo: ', userInfo.value)
                loggedIn.value = true
            }
        })

        return {
            loggedIn,
            userInfo,
            idToken,
        }
    },
})
</script>
