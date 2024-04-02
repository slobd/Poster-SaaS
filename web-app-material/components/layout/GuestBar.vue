<template>
    <div>
        <VRow
            align="end"
            align-content="end"
            justify="space-around"
            no-gutters
            class="tw-space-x-2"
        >
            <VBtn v-if="getTheme.posterlab" depressed text plain> Contact </VBtn>
            <VBtn depressed text plain target="_blanc" href="https://posterlab.co">
                About PosterLab
            </VBtn>
            <VBtn depressed outlined to="/auth/login" class=""> Login </VBtn>
            <VBtn depressed color="primary" to="/auth/register"> Register </VBtn>
        </VRow>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
export default Vue.extend({
    computed: {
        ...mapGetters('tenant', ['getTheme']),
    },
})
</script>
