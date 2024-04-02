<template>
    <VDialog v-model="dialog" max-width="600px">
        <template #activator="{ on, attrs }">
            <VBtn class="tw-mx-2 tw-mt-2" color="primary" v-bind="attrs" v-on="on"
                >Add Co-Author</VBtn
            >
        </template>
        <VCard>
            <ValidationObserver ref="observer" v-slot="{ handleSubmit, reset }" disabled>
                <VCard-title>
                    <span class="text-h5">User Profile</span>
                </VCard-title>
                <VCardText>
                    <div>
                        <VRow>
                            <VCol cols="12" sm="6">
                                <VeeTextField
                                    v-model="user.firstName"
                                    rules="required"
                                    label="First name"
                                    vid="firstName"
                                    required
                                    outlined
                                />
                            </VCol>
                            <VCol cols="12" sm="6">
                                <VeeTextField
                                    v-model="user.lastName"
                                    rules="required"
                                    label="Last name"
                                    vid="lastName"
                                    outlined
                                />
                            </VCol>
                            <VCol cols="12">
                                <VeeTextField
                                    v-model="user.email"
                                    rules="required|email"
                                    label="Email"
                                    vid="email"
                                    outlined
                                />
                            </VCol>
                            <VCol cols="12">
                                <VeeTextField
                                    v-model="user.organizationName"
                                    label="Organization"
                                    vid="organization"
                                    outlined
                                />
                            </VCol>
                        </VRow>
                    </div>
                    <small>*indicates required field</small>
                </VCardText>
                <VCardActions>
                    <VSpacer></VSpacer>
                    <VBtn text @click="dialog = false"> Close</VBtn>
                    <VBtn color="primary" @click="handleSubmit(() => onSubmit(reset))"> Add</VBtn>
                </VCardActions>
            </ValidationObserver>
        </VCard>
    </VDialog>
</template>
<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'

export default defineComponent({
    name: 'UploadAddUserDialog',
    setup(_props, { emit }) {
        const dialog = ref(false)
        const defaultUser = {
            firstName: '',
            lastName: '',
            email: '',
            organizationName: '',
        }
        const user = ref({ ...defaultUser })

        function onSubmit(reset) {
            emit('input', user.value)
            user.value = defaultUser
            reset()
        }

        return {
            dialog,
            user,
            onSubmit,
        }
    },
})
</script>
