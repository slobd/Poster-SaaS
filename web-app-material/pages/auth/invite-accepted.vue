<template>
    <VContainer class="tw-bg-primary tw-h-full tw-flex tw-justify-center" fluid>
        <VCard class="tw-mt-28 tw-w-1/2 tw-h-80">
            <VCardTitle class="text-h3 justify-center tw-pt-5">
                <span> Welcome to PosterLab! </span>
            </VCardTitle>
            <VCardText class="text-h5 text-center tw-mt-5">
                <VRow>
                    <VCol cols="12">
                        <span> Your invitation has been validated. </span>
                    </VCol>
                    <VCol cols="12">
                        <span>
                            Please sign in to join your workspaces and start collaborating.
                        </span>
                    </VCol>
                </VRow>
            </VCardText>
            <VCardActions class="text-h5 justify-center tw-mt-5">
                <VBtn x-large color="primary" to="/auth/login">Sign In </VBtn>
            </VCardActions>
        </VCard>
    </VContainer>
</template>

<script>
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
    auth: false,
    layout: 'auth',
})
</script>

<style scoped></style>
