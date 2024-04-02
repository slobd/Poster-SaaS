<template>
    <VRow>
        <VCol v-for="(poster, i) in posters" :key="i" cols="6" md="4">
            <GalleryDocumentCard :poster="poster" />
        </VCol>
    </VRow>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Poster } from '~/types/entities/Poster.entity'

export default defineComponent({
    name: 'GalleryGrid',
    props: {
        posters: {
            type: Array as PropType<Poster[]>,
            default: () => [] as Poster[],
            required: true,
        },
    },
})
</script>
