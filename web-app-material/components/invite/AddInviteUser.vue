<template>
    <ValidationObserver
        disabled
        v-slot="{ handleSubmit, invalid }"
        tag="form"
        data-cy="invite"
        class="row"
    >
        <VCol cols="8" class="tw-pb-0 tw-pt-5">
            <span>{{ title }}</span>
        </VCol>
        <VCol cols="6">
            <ValidationProvider
                v-slot="vpEmail"
                name="email"
                mode="eager"
                rules="email|required"
                slim
            >
                <VTextField
                    v-model="email"
                    outlined
                    dense
                    label="Work Email"
                    background-color="white"
                    :error-messages="vpEmail.errors"
                />
            </ValidationProvider>
        </VCol>
        <VCol cols="4">
            <VSelect
                v-model="role"
                :items="roles.map((r) => r.name)"
                label="Select Role"
                outlined
                dense
                background-color="white"
            ></VSelect>
        </VCol>
        <VCol cols="2">
            <VBtn
                :disabled="!role || invalid"
                color="primary"
                depressed
                @click="handleSubmit(addUser)"
            >
                ADD
            </VBtn>
        </VCol>
    </ValidationObserver>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from '@nuxtjs/composition-api'
interface UserRole {
    id: number
    name: string
}
export default defineComponent({
    name: 'AddInviteUser',
    props: {
        roles: {
            type: Array as PropType<UserRole[]>,
            default: () => [],
        },
        title: {
            type: String,
            default: 'Send email invites to new members',
        },
    },
    setup(props, { emit }) {
        const email = ref()
        const role = ref()

        function addUser() {
            emit('add', {
                email: email.value,
                role: role.value,
                roleId: props.roles.filter((r) => r.name === role.value)[0].id,
            })
        }

        return {
            email,
            role,
            addUser,
        }
    },
})
</script>

<style scoped></style>
