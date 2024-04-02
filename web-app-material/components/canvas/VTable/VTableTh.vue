<template>
    <th
        class="
            px-4
            py-1
            bg-gray-50
            text-left text-xs
            leading-4
            font-medium
            text-gray-500
            uppercase
            tracking-wider
        "
    >
        <slot></slot>
    </th>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    name: 'VTableTh',
})
</script>

<style scoped></style>
