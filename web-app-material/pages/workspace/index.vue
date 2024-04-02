<template>
    <div class="tw-px-10 tw-py-7">
        <WebMetadata />
        <div class="tw-flex tw-justify-between tw-items-center tw-pb-9">
            <h1 class="tw-font-bold tw-text-lg">All Workspaces</h1>
            <VBtn
                v-if="$can('create', caslWorkspace)"
                depressed
                color="primary"
                @click="clickCreateWorkspace()"
            >
                <FontAwesomeIcon :icon="icons.faPlus" class="tw-mx-1" />
                NEW WORKSPACE
            </VBtn>
        </div>
        <div class="tw-flex tw-justify-between tw-items-center tw-pb-9">
            <VTextField
                class="tw-mr-2 tw-max-w-xl"
                append-icon="mdi-magnify"
                label="Search"
                single-line
                hide-details
                outlined
                height="10"
                dense
                @change="searchInputChange"
            >
            </VTextField>
        </div>

        <div class="tw-grid tw-grid-cols-12 tw-gap-8">
            <VCard
                v-for="workspace in workspaceList"
                :key="workspace.id"
                class="grey lighten-5 tw-col-span-4 tw-row-span-4 tw-py-4 tw-px-6 tw-rounded-lg"
                elevation="1"
                outlined
            >
                <div class="tw-flex">
                    <NuxtLink
                        class="
                            tw-flex-1 tw-no-underline tw-text-lg tw-text-black tw-font-bold tw-mr-2
                        "
                        :to="`/workspace/${workspace.id}/home`"
                        @click="selectWorkspace(workspace.id)"
                    >
                        {{ workspace.name }}
                        <VIcon v-if="workspace.visibility === 'PRIVATE'" small>mdi-lock</VIcon>
                    </NuxtLink>
                    <VMenu offset-x offset-y transition="scale-transition" class="tw-text-right">
                        <template #activator="{ on, attrs }">
                            <VBtn v-bind="attrs" icon class="tw--mt-1 tw--mr-2" v-on="on">
                                <FontAwesomeIcon
                                    class="grey--text text--lighten-1 tw-text-base"
                                    :icon="icons.faEllipsisV"
                                />
                            </VBtn>
                        </template>
                        <WorkspaceMenuList :workspace="workspace" />
                    </VMenu>
                </div>
            </VCard>
        </div>

        <VDialog v-model="showCreateWorkspaceModel" max-width="600px" persistent>
            <!-- transition component help to keep leave transition before child is destroyed -->
            <transition :duration="150">
                <WorkspaceForm v-if="showCreateWorkspaceModel" />
            </transition>
        </VDialog>
        <WorkspaceDeleteDialog />
    </div>
</template>

<script lang="ts">
import { defineComponent, useFetch, useContext, computed } from '@nuxtjs/composition-api'
import { subject } from '@casl/ability'
import { faPlus, faEllipsisV } from '@fortawesome/pro-solid-svg-icons'
import useIcons from '~/composables/common/useIcons'
import WorkspaceMenuList from '~/components/workspace/WorkspaceMenuList.vue'

export default defineComponent({
    name: 'Workspaces',
    components: { WorkspaceMenuList },
    layout: 'tenant',
    setup() {
        const { icons } = useIcons({
            faPlus,
            faEllipsisV,
        })
        const { $accessor, $auth } = useContext()
        useFetch(async () => {
            await $accessor.workspace.fetchAllWorkspace({
                tenantId: $accessor.tenant.getTenantId as number,
                search: '',
            })
        })

        const showCreateWorkspaceModel = computed(() => {
            return $accessor.workspace.getCreateWorkspaceModal.status
        })

        const workspaceList = computed(() => $accessor.workspace.getWorkspaceList)
        const caslUser = computed(() =>
            subject('User', {
                roles: {
                    role: {
                        domain: `Workspace/${$accessor.workspace.getWorkspaceId}`,
                    },
                },
            })
        )

        const caslWorkspace = computed(() =>
            subject('Workspace', {
                tenantId: $accessor.tenant.getTenantId as number,
            })
        )

        /* -- Methods -- */
        async function searchInputChange(searchString: string) {
            await $accessor.workspace.setStateSearchKey({ searchKey: searchString })
            await $accessor.workspace.fetchAllWorkspace({
                search: searchString,
                tenantId: $auth.user.id,
            })
        }

        async function selectWorkspace(workspaceId: number) {
            await $accessor.workspace.fetchWorkspace({ id: workspaceId })
        }

        function clickCreateWorkspace() {
            $accessor.workspace.setCreateWorkspaceModal({
                newWorkspace: true,
                status: true,
            })
        }

        return {
            icons,
            workspaceList,
            caslUser,
            caslWorkspace,
            showCreateWorkspaceModel,
            searchInputChange,
            selectWorkspace,
            clickCreateWorkspace,
        }
    },
})
</script>

<style></style>
