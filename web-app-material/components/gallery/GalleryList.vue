<template>
    <VSimpleTable fixed-header dense>
        <template #default>
            <thead>
                <tr>
                    <th v-if="columns.includes('image')" class="tw-text-left tw-w-48">Image</th>
                    <th v-if="columns.includes('title')" class="tw-text-left">Title</th>
                    <th v-if="columns.includes('authors')" class="tw-text-left tw-w-2/12">
                        Authors
                    </th>
                    <th v-if="columns.includes('organization')" class="tw-text-left">
                        Organization
                    </th>
                    <th v-if="columns.includes('topics')" class="tw-text-left">Topics</th>
                    <th v-if="columns.includes('keywords')" class="tw-text-left">Keywords</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(poster, i) in posters"
                    :key="i"
                    class="tw-cursor-pointer"
                    @click="$router.push(`/workspace/${workspaceId}/gallery/${poster.id}/document`)"
                >
                    <td v-if="columns.includes('image')" class="tw-p-2">
                        <VImg
                            v-if="poster.image && poster.image.location"
                            width="150"
                            class="elevation-6"
                            :alt="poster.title"
                            :src="poster.image && poster.image.location"
                        />
                        <!--                    <div v-else class="grey lighten-1 tw-w-full tw-h-full">Image poster</div>-->
                        <VSkeletonLoader
                            v-else
                            elevation="2"
                            type="image"
                            boilerplate
                            height="100"
                            width="100"
                        />
                    </td>
                    <td v-if="columns.includes('title')" class="tw-p-2">
                        <div>
                            <span class="tw-text-xs">
                                {{ new Date(poster.createdAt).toLocaleDateString() }}
                            </span>
                            <VisibilityChip :name="poster.visibility" />
                        </div>
                        <span class="tw-text-lg tw-font-semibold tw-leading-6">
                            {{ poster.title || 'No title' }}
                        </span>
                    </td>
                    <td v-if="columns.includes('authors')" class="tw-p-2 tw-w-2/12">
                        <div class="tw-flex tw-flex-col">
                            <span class="tw-text-sm tw-leading-5 tw-font-bold">
                                {{ getFullName(poster.user) }}
                            </span>
                            <span
                                v-for="author in removeLead(poster)"
                                :key="`${poster.id}-${author.id}`"
                                class="tw-text-sm tw-leading-5"
                            >
                                {{ getFullName(author) }}
                            </span>
                        </div>
                    </td>
                    <td v-if="columns.includes('organization')" class="tw-p-2">
                        {{ getOrganization(poster) }}
                    </td>
                    <td v-if="columns.includes('topics')" class="tw-p-2">
                        <VChip
                            v-for="topic in poster.topics"
                            :key="`${poster.id}-topic-${topic.name}`"
                            :ripple="false"
                            class="tw-m-1"
                            small
                        >
                            {{ topic.name }}
                        </VChip>
                    </td>
                    <td v-if="columns.includes('keywords')" class="tw-p-2">
                        <VChip
                            v-for="keyword in poster.keywords"
                            :key="`${poster.id}-keyword-${keyword.name}`"
                            :ripple="false"
                            class="tw-mr-1 tw-mb-1"
                            small
                        >
                            {{ keyword.name }}
                        </VChip>
                    </td>
                </tr>
            </tbody>
        </template>
    </VSimpleTable>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import capitalize from 'lodash/capitalize'
import { Poster } from '~/types/entities/Poster.entity'
import useUser from '~/composables/entities/useUser'
import usePoster from '~/composables/gallery/usePoster'

export default defineComponent({
    name: 'GalleryList',
    props: {
        posters: {
            type: Array as PropType<Poster[]>,
            default: () => [] as Poster[],
        },
        columns: {
            type: Array,
            default: () => ['image', 'title', 'topics', 'keywords', 'authors', 'organization'],
        },
    },
    setup() {
        // Register composables
        const { $accessor } = useContext()
        const { getFullName } = useUser()
        const { getOrganization, removeLead } = usePoster()

        const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)

        return {
            getFullName,
            getOrganization,
            capitalize,
            removeLead,
            workspaceId,
        }
    },
    methods: {
        colorVisibility(poster) {
            const colorVisibility = {
                PUBLIC: 'green accent-1',
                PRIVATE: 'red lighten-4',
            }
            return colorVisibility[poster.visibility.name]
        },
    },
})
</script>
