<template>
    <tr @click="$emit('click')">
        <slot></slot>
    </tr>
</template>

<script>
export default {
    name: 'VTableTr',
}
</script>

<style scoped></style>
