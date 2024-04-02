<template>
    <div class="flex flex-col max-w-full">
        <div class="overflow-x-auto">
            <div class="inline-block min-w-full align-middle">
                <div class="overflow-hidden border-b border-gray-200 shadow">
                    <table class="min-w-full divide-y divide-gray-200 v-table">
                        <slot></slot>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    name: 'VTable',
})
</script>

<style scoped></style>
