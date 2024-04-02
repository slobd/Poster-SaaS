<template>
    <VCard class="tw-h-full tw-p-4 blue-grey lighten-5 tw-text-left">
        <div>
            <h3 class="tw-text-base tw-mb-1">DESCRIPTION</h3>
            <p
                v-if="document.description && document.description.length > 100"
                class="tw-text-base"
            >
                {{ document.description.slice(0, 100) }}...
                <VBtn
                    text
                    x-small
                    class="blue--text darken-1"
                    :to="`/workspace/${workspaceId}/gallery/${document.id}/abstract`"
                >
                    Full abstract
                </VBtn>
            </p>
            <p v-else class="tw-text-base">
                {{ document.description }}
            </p>
        </div>

        <div v-if="document && document.topics" class="tw-mb-3">
            <h2 class="tw-text-base">TOPICS</h2>
            <VChip
                v-for="topic in document.topics"
                :key="`${document.id}-topic-${topic.name}`"
                :ripple="false"
                label
                color="cyan lighten-4"
                class="tw-mr-1 tw-mb-1"
                small
            >
                {{ topic.name }}
            </VChip>
        </div>
        <div v-if="document && document.keywords" class="tw-mb-3">
            <h2 class="tw-text-sm">KEYWORDS</h2>
            <VChip
                v-for="keyword in document.keywords"
                :key="`${document.id}-keyword-${keyword.name}`"
                :ripple="false"
                label
                color="cyan lighten-5"
                class="tw-mr-1 tw-mb-1"
                small
            >
                {{ keyword.name }}
            </VChip>
        </div>
    </VCard>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropType } from 'vue/types'
import { Poster } from '~/types/entities/Poster.entity'

export default Vue.extend({
    props: {
        document: {
            type: Object as PropType<Poster>,
            required: true,
        },
        workspaceId: {
            type: Number,
            required: true,
        },
    },
})
</script>

<style></style>
