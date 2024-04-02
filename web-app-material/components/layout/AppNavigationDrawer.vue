<template>
    <VNavigationDrawer
        v-model="drawer"
        mobile-breakpoint="0"
        clipped
        fixed
        app
        color="white"
        :width="drawerWidth()"
    >
        <div v-if="layoutType !== 'firstLevel'" class="top-logo-wrap">
            <NuxtLink :to="allWorkspacePageUrl">
                <img :src="primaryLogo" alt="PosterLab" class="top-logo-img" />
            </NuxtLink>
        </div>
        <VDivider v-if="layoutType !== 'firstLevel'" />

        <div class="tw-flex" :class="layoutType === 'firstLevel' ? 'tw-h-full' : 'sidebar-menu-h'">
            <div class="primary sidebar-left">
                <div>
                    <div class="sidebar-left-item tw-mt-2">
                        <VTooltip right>
                            <template #activator="{ on, attrs }">
                                <VBtn
                                    icon
                                    left
                                    class="tw-text-white"
                                    x-large
                                    href="/workspace"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <FontAwesomeIcon size="lg" :icon="icons.faBriefcase" />
                                </VBtn>
                            </template>
                            <span>All workspaces</span>
                        </VTooltip>
                    </div>
                    <div v-if="$can('create', caslWorkspace)" class="sidebar-left-item">
                        <VTooltip right>
                            <template #activator="{ on, attrs }">
                                <VBtn
                                    icon
                                    left
                                    class="tw-text-white"
                                    x-large
                                    v-bind="attrs"
                                    @click="clickCreateWorkspace()"
                                    v-on="on"
                                >
                                    <FontAwesomeIcon :icon="icons.faPlus" />
                                </VBtn>
                            </template>
                            <span>Create new workspace</span>
                        </VTooltip>
                    </div>
                </div>
                <div class="tw-m-2">
                    <AppUserMenu />
                </div>
            </div>

            <div v-if="layoutType !== 'firstLevel'" class="tw-h-full">
                <div
                    class="
                        tw-py-3 tw-px-4
                        text-xs
                        tw-opacity-70
                        tw-tracking-widest
                        tw-text-xs
                        tw-flex
                        tw-justify-between
                        tw-items-center
                    "
                >
                    <a
                        href="/workspace"
                        class="text-decoration-none text--black text-caption black--text"
                    >
                        <FontAwesomeIcon :icon="icons.faArrowLeft" />
                        All workspaces
                    </a>
                    <VMenu
                        v-if="$can('update', caslWorkspace) || $can('update', caslUser)"
                        offset-x
                        offset-y
                        transition="scale-transition"
                    >
                        <template #activator="{ on, attrs }">
                            <VBtn
                                v-bind="attrs"
                                icon
                                color="tw-text-black"
                                size="16"
                                class="tw-mb-0.5 tw-text-right"
                                v-on="on"
                            >
                                <FontAwesomeIcon
                                    class=""
                                    :icon="icons.faCog"
                                    color="tw-text-black"
                                    width="24"
                                />
                            </VBtn>
                        </template>
                        <WorkspaceMenuList :workspace="$accessor.workspace.getDefaultWorkspace" />
                    </VMenu>
                </div>
                <div class="workspace-name">
                    <span class="tw-line-clamp-4 tw-w-32">
                        {{ workspaceName }}
                        <VIcon v-if="workspaceVisibility === 'PRIVATE'" small>mdi-lock</VIcon>
                    </span>
                </div>
                <VBtn
                    v-if="$can('create', caslUser)"
                    small
                    outlined
                    class="tw-ml-4"
                    @click="$accessor.setInviteModal(true)"
                >
                    <FontAwesomeIcon :icon="icons.faPlus" class="tw-mr-1.5" />
                    INVITE
                </VBtn>

                <VList flat dense class="tw-pb-0 tw-text-bold">
                    <template v-for="item in listItems">
                        <AppNavigationDrawerItem :key="item.title" :item="item" />
                    </template>
                </VList>

                <VListGroup :value="true" class="tw-ml-1">
                    <template #activator>
                        <VListItemTitle class="tw-text-black tw-text-xs">
                            <FontAwesomeIcon
                                :icon="icons.faPlug"
                                class="tw-ml-1 tw-mr-1 tw-opacity-60"
                            />
                            <span class="tw-leading-4 tw-font-normal tw-text-sm"> Addons </span>
                        </VListItemTitle>
                    </template>

                    <VList flat dense class="tw-p-0">
                        <template v-for="item in addOnsItems">
                            <AppNavigationDrawerItem :key="item.title" :item="item" />
                        </template>
                    </VList>
                </VListGroup>
            </div>
        </div>
        <InviteModal />

        <VDialog v-model="showCreateWorkspaceModel" max-width="600px" persistent>
            <!-- transition component help to keep leave transition before child is destroyed -->
            <transition :duration="150">
                <WorkspaceForm v-if="showCreateWorkspaceModel" />
            </transition>
        </VDialog>

        <WorkspaceDeleteDialog />
    </VNavigationDrawer>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext } from '@nuxtjs/composition-api'
import {
    faCog,
    faUser,
    faBriefcase,
    faPlus,
    faPlug,
    faHome,
    faArrowLeft,
} from '@fortawesome/pro-solid-svg-icons'
import { subject } from '@casl/ability'
import useIcons from '~/composables/common/useIcons'
import { IAppNavigationDrawerItem } from '~/components/Layout/AppNavigationDrawerItem.vue'

export default defineComponent({
    name: 'AppNavigationDrawer',
    props: {
        layoutType: {
            type: String,
            default: '',
            required: false,
        },
    },
    setup(props) {
        const { $accessor } = useContext()
        const { icons } = useIcons({
            faCog,
            faUser,
            faBriefcase,
            faPlus,
            faPlug,
            faHome,
            faArrowLeft,
        })

        const drawer = ref<null | boolean>(null)

        const workspaceId = computed(() => $accessor.workspace.getWorkspaceId)

        const workspaceName = computed(() => {
            if ($accessor.workspace.getDefaultWorkspace.name?.length >= 50) {
                return `${$accessor.workspace.getDefaultWorkspace.name.slice(0, 50)}...`
            } else {
                return $accessor.workspace.getDefaultWorkspace.name
            }
        })

        const workspaceVisibility = computed(() => {
            return $accessor.workspace.getDefaultWorkspace.visibility
        })

        const allWorkspacePageUrl = computed(() => `/workspace`)

        const showCreateWorkspaceModel = computed(() => {
            return $accessor.workspace.getCreateWorkspaceModal.status
        })

        const listItems = computed<IAppNavigationDrawerItem[]>(() => {
            const items = [
                {
                    icon: faHome,
                    title: 'Home',
                    to: `/workspace/${workspaceId.value}/home`,
                },
            ]

            // TODO: This may cause a SSR error, child mismatch
            items.push({
                icon: faBriefcase,
                title: 'Projects',
                to: `/workspace/${workspaceId.value}/project`,
            })

            items.push({
                icon: faUser,
                title: 'People',
                to: `/workspace/${workspaceId.value}/users`,
            })

            return items
        })

        const addOnsItems = computed<IAppNavigationDrawerItem[]>(() => [
            {
                icon: [],
                title: 'Gallery',
                to: `/workspace/${workspaceId.value}/gallery`,
            },
            {
                icon: [],
                title: 'Find a partner',
                to: `/workspace/${workspaceId.value}/find-partner`,
            },
        ])

        const caslWorkspace = computed(() => {
            return subject('Workspace', { ...$accessor.workspace.getDefaultWorkspace })
        })

        const caslUser = computed(() =>
            subject('User', {
                id: $accessor.workspace.getWorkspaceId,
                tenantId: $accessor.tenant.getTenantId,
            })
        )

        const primaryLogo = computed(() => {
            if ($accessor.tenant.getTheme.images?.primaryLogo?.url)
                return $accessor.tenant.getTheme.images?.primaryLogo?.url
            else return require('~/assets/img/PosterLabLogo.svg')
        })

        function drawerWidth() {
            if (props.layoutType === 'firstLevel') {
                return '58px'
            } else {
                return '236px'
            }
        }
        function clickCreateWorkspace() {
            $accessor.workspace.setCreateWorkspaceModal({
                newWorkspace: true,
                status: true,
            })
        }

        return {
            drawer,
            workspaceVisibility,
            allWorkspacePageUrl,
            listItems,
            addOnsItems,
            icons,
            primaryLogo,
            workspaceId,
            workspaceName,
            caslWorkspace,
            caslUser,
            showCreateWorkspaceModel,
            drawerWidth,
            clickCreateWorkspace,
        }
    },
})
</script>

<style scoped>
.top-logo-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 56px;
}

.top-logo-img {
    display: block;
    height: 40px;
}

.v-application--is-ltr .v-list-item__action:first-child,
.v-application--is-ltr .v-list-item__icon:first-child {
    margin-right: 8px;
}

.sidebar-left {
    width: 3.625rem;
    @apply tw-flex tw-flex-col tw-justify-between;
}

.sidebar-left-item {
    @apply tw-bg-opacity-25;
}

.sidebar-left-item a {
    padding-left: 0.17rem;
}

.sidebar-menu-h {
    min-height: calc(100vh - 57px);
}

.workspace-name {
    @apply tw-text-lg;
    @apply tw-text-black;
    @apply tw-font-medium;
    @apply tw-mb-1;
    @apply tw-mx-4;
    @apply tw-leading-6;
}

.v-list-group__header.v-list-item.v-list-item--link {
    min-height: 43.95px;
}
</style>
