<template>
    <div class="page-wrapper grey lighten-4">
        <!-- TODO: Guest message -->
        <WebMetadata />
        <header class="page-header tw-py-2 tw-px-10">
            <h1 class="tw-font-bold tw-text-lg">{{ title }}</h1>
            <VSpacer />
            <VTextField
                v-model="search"
                class="users-search-input tw-max-w-sm"
                placeholder="Name, Skill, Topic, Organization, Keyword, Position and Biography"
                clearable
                dense
                :hide-details="true"
            >
                <template #prepend-inner>
                    <FontAwesomeIcon
                        class="tw-text-gray-400 tw-mr-2"
                        fixed-width
                        :icon="icons.faSearch"
                    />
                </template>
            </VTextField>
            <VBtn
                v-if="$can('create', caslUser)"
                small
                outlined
                class="tw-ml-6"
                @click="$accessor.setInviteModal(true)"
            >
                <FontAwesomeIcon :icon="icons.faPlus" class="tw-mr-1.5" />
                INVITE
            </VBtn>
        </header>
        <VDivider />

        <div class="grey lighten-3 tw-flex tw-pl-10 tw-pr-3 tw-items-center tw-justify-center">
            <p class="tw-my-auto tw-font-bold tw-text-sm tw-opacity-60">Sort by:</p>
            <div class="tw-p-3 tw-w-48">
                <VSelect
                    :items="sortOptions"
                    :label="sortOptions[0]"
                    background-color="white"
                    dense
                    outlined
                    hide-details="auto"
                    @change="currentSorting = $event"
                >
                </VSelect>
            </div>
            <VSpacer />

            <p class="tw-my-auto tw-mr-4 tw-font-bold tw-text-sm tw-opacity-60">View mode:</p>
            <VBtnToggle v-model="layout" mandatory dense>
                <VBtn :value="1" icon>
                    <FontAwesomeIcon fixed-width size="lg" :icon="icons.faGripHorizontal" />
                </VBtn>

                <VBtn :value="2" icon>
                    <FontAwesomeIcon fixed-width size="lg" :icon="icons.faThList" />
                </VBtn>
            </VBtnToggle>
        </div>
        <div class="tw-mt-5 tw-px-10">
            <UsersGrid v-if="layout === 1" :users="searchedUsers" />
            <UsersTable
                v-else-if="layout === 2"
                :users="searchedUsers"
                @setSearch="setSearch($event)"
            />
        </div>

        <div v-if="!searchedUsers.length" class="text-center">
            <NoContentDialog :image="require('~/assets/img/findexpert.png')" />
        </div>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    ref,
    useContext,
    useFetch,
    useRoute,
    watch,
} from '@nuxtjs/composition-api'
import { faGripHorizontal, faThList, faSearch, faPlus } from '@fortawesome/pro-solid-svg-icons'
import { subject } from '@casl/ability'
import useIcons from '~/composables/common/useIcons'
import useExperts from '~/composables/experts/useExperts'
import { ExpertLayout } from '~/constants/experts.constants'

export default defineComponent({
    setup() {
        // Register composables
        const { $accessor } = useContext()
        const { icons } = useIcons({
            faGripHorizontal,
            faThList,
            faSearch,
            faPlus,
        })
        const { search, currentSorting, fetchUsers, ...expertsSetup } = useExperts()
        const $route = useRoute()
        const layout = ref(ExpertLayout.GRID)

        // Hooks
        const { fetch } = useFetch(() => fetchUsers(parseInt($route.value.params.workspaceId)))

        watch(currentSorting, () => {
            fetch()
        })
        // Computed
        const title = computed(() => 'People')
        const caslUser = computed(() =>
            subject('User', {
                id: $accessor.workspace.getWorkspaceId,
                tenantId: $accessor.tenant.getTenantId,
            })
        )

        function setSearch(skill: string) {
            search.value = skill
        }

        return {
            search,
            icons,
            currentSorting,
            layout,
            title,
            caslUser,
            fetchUsers: fetch,
            ...expertsSetup,
            setSearch,
        }
    },
})
</script>

<style lang="scss">
.users-search-input {
    .v-input__prepend-inner {
        align-self: center;
    }
}
</style>
