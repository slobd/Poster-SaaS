<template>
    <VApp fluid class="hero" align="center">
        <Nuxt />
    </VApp>
</template>

<script>
export default {
    name: 'Empty',
}
</script>

<style scoped>
.hero {
    background: url('~/assets/img/homeBackground.png');
    background-size: cover;
    height: 100vh;
}
</style>
