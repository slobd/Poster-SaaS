<template>
    <div>
        <h1>Temporary user page</h1>
        <div v-if="$auth.user">
            <pre>{{ $auth.user }}</pre>
        </div>
    </div>
</template>

<script>
export default {
    auth: false,
    name: 'UserPage',
    // async mounted() {
    //     if (this.$route.query.access_token) {
    //         await this.$auth.setUserToken(this.$route.query.access_token)
    //         await this.$auth.fetchUser()
    //     }
    // },
}
</script>

<style scoped></style>
