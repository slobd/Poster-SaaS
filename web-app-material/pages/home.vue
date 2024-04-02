<template>
    <VContainer fill-height fluid>
        <WebMetadata />
        <VRow no-gutters align="center" justify="center" class="tw-h-full">
            <VCol justify="center" cols="12">
                <VCard
                    class="
                        tw-h-1/2 tw-w-1/2 tw-py-10 tw-flex tw-justify-center tw-items-center
                        text-center
                    "
                >
                    <div class="tw-w-1/2 text-center">
                        <div class="text-h5">Welcome</div>
                        <h4 class="text-h4 justify-center">
                            {{ getTheme.name }}
                        </h4>
                        <VCardText>
                            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis
                            suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis
                            autem vel eum iure reprehenderit qui in ea voluptate velit esse quam
                            nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo
                            voluptas nulla pariatur?
                        </VCardText>
                        <VCardActions class="tw-justify-center">
                            <VBtn large color="primary" class="tw-px-6" to="/upload/new?step=1">
                                Upload document
                            </VBtn>
                        </VCardActions>
                    </div>
                </VCard>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    auth: false,
    computed: {
        ...mapGetters('tenant', ['getTheme']),
    },
    async mounted() {
        if (this.$route.query.access_token) {
            await this.$auth.setUserToken(this.$route.query.access_token)
            await this.$auth.fetchUser()
        }
    },
}
</script>

<style scoped></style>
