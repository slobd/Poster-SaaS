<template>
    <div class="page-wrapper grey lighten-4">
        <WebMetadata />
        <header class="page-header tw-py-2 tw-px-10">
            <h1 class="tw-font-bold tw-text-lg">Projects</h1>
        </header>
        <VDivider />

        <div class="tw-px-10 tw-py-7 tw-flex tw-items-center tw-justify-between">
            <VTextField
                class="project-search-input"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                outlined
                dense
                @change="searchInputChange"
            >
            </VTextField>
            <VBtn
                v-if="$can('create', caslProject)"
                class="tw-text-sm tw-ml-4"
                color="primary"
                depressed
                @click="$accessor.project.setCreateProjectModal(true)"
            >
                <FontAwesomeIcon :icon="icons.faPlus" class="tw-mx-1" />
                <span>NEW PROJECT</span>
            </VBtn>
        </div>

        <div class="tw-px-10 tw-pt-2">
            <VCard
                v-for="(project, projectIndex) in projectsList"
                :key="project.id + '-' + projectIndex"
                elevation="1"
                outlined
                class="tw-mb-4 tw-p-3 tw-text-left tw-flex tw-rounded-xl"
            >
                <NuxtLink
                    class="tw-flex-1 tw-no-underline"
                    :to="`/workspace/${$route.params.workspaceId}/project/${project.id}/information-tab`"
                >
                    <VCardTitle class="tw-pt-1 tw-pb-2 tw-text-lg tw-text-black">
                        {{ project.name }}
                    </VCardTitle>
                    <div
                        v-if="getDescription(project)"
                        class="tw-px-4 tw-pb-3 tw-text-xs tw-text-black"
                    >
                        {{ getDescription(project) }}
                    </div>
                    <ul v-if="getKeywords(project).length" class="keywords-list">
                        <li
                            v-for="(keyword, keywordIndex) in getKeywords(project)"
                            :key="keyword.name + '-' + keywordIndex"
                            class="keyword-tag"
                        >
                            {{ keyword.name }}
                        </li>
                    </ul>
                </NuxtLink>
                <ProjectDetailMenu v-model="project.id" class="tw-text-right" />
            </VCard>
        </div>
        <CreateNewProjectDialog />
    </div>
</template>

<script lang="ts">
import { faPlus } from '@fortawesome/pro-solid-svg-icons'
import {
    defineComponent,
    ref,
    useFetch,
    useContext,
    useRoute,
    computed,
} from '@nuxtjs/composition-api'
import { subject } from '@casl/ability'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'UserManagement',
    setup() {
        const { icons } = useIcons({
            faPlus,
        })
        const { $accessor } = useContext()
        const $route = useRoute()

        const searchKey = ref('')

        useFetch(async () => {
            await $accessor.project.fetchAllProject({
                data: {},
                workspaceId: parseInt($route.value.params.workspaceId),
            })
        })

        /* -- Computed -- */
        const projectsList = computed(() => $accessor.project.getProjectsList)
        const caslProject = computed(() =>
            subject('Project', {
                workspaceId: $accessor.workspace.getWorkspaceId,
            })
        )

        /* -- Methods -- */
        function getDescription(project) {
            return project?.informationTabs?.length > 0
                ? project.informationTabs[0].description
                : ''
        }
        function getKeywords(project) {
            return project?.informationTabs?.length > 0 ? project.informationTabs[0].keywords : []
        }

        async function searchInputChange(searchString: string) {
            searchKey.value = searchString
            await $accessor.project.setStateSearchKey({ searchKey: searchString })
            await $accessor.project.fetchAllProject({
                data: {
                    name: searchKey.value,
                },
                workspaceId: parseInt($route.value.params.workspaceId),
            })
        }

        return {
            icons,
            projectsList,
            caslProject,
            getDescription,
            getKeywords,
            searchInputChange,
        }
    },
})
</script>

<style scoped>
.project-search-input {
    max-width: 500px;
}

.keywords-list {
    display: flex;
    list-style: none;
    @apply tw-px-4;
    @apply tw-pb-1.5;
}

.keyword-tag {
    @apply tw-mr-3;
    @apply tw-px-4;
    @apply tw-text-sm;
    @apply tw-border;
    @apply tw-border-solid;
    @apply tw-rounded-full;
    @apply tw-text-indigo-800;
    @apply tw-border-indigo-800;
}
</style>
