<template>
    <div></div>
</template>

<script>
import { defineComponent, onMounted, useRoute, useRouter } from '@nuxtjs/composition-api'

export default defineComponent({
    name: 'RedirectUri',
    auth: false,
    setup() {
        const $route = useRoute()
        const $router = useRouter()

        onMounted(async () => {
            const uri = $route.value.query.uri

            if (uri) {
                await $router.push(decodeURIComponent(uri))
            } else {
                await $router.push('/')
            }
        })

        return {}
    },
})
</script>

<style scoped></style>
