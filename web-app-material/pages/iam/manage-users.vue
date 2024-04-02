<template>
    <div>
        <WebMetadata />
        <VToolbar flat>
            <VToolbarTitle>Manage Users</VToolbarTitle>

            <VSpacer />

            <IamInviteUserDialog>
                <template #activator="{ on, attrs }">
                    <VBtn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
                        <FontAwesomeIcon
                            :icon="icons.faUserPlus"
                            size="lg"
                            fixed-width
                            class="tw-pr-2"
                        />
                        Invite new user
                    </VBtn>
                </template>
            </IamInviteUserDialog>
        </VToolbar>

        <VCard class="tw-mx-4">
            <VDataTable :headers="headers" :items="getUsers" :search="search">
                <template #top>
                    <VCardTitle>
                        <VTextField
                            v-model="search"
                            append-icon="mdi-magnify"
                            label="Search"
                            single-line
                            hide-details
                        />
                    </VCardTitle>
                </template>

                <template #[`item.name`]="{ item }">
                    {{ item.firstName }} {{ item.lastName }}
                </template>

                <template #[`item.role`]="{ item }">
                    <VSelect
                        :value="modifiedRoles[item.id] || item.roles[0].name"
                        :items="getRolesNames.filter((name) => name !== 'GUEST')"
                        :readonly="item.email === superAdminEmail"
                        @change="selectRole(item.id, $event)"
                    />
                </template>

                <template #[`item.save`]="{ item }">
                    <div class="tw-flex tw-justify-center">
                        <VBtn
                            v-if="modifiedRoles[item.id]"
                            :disabled="item.email === superAdminEmail"
                            outlined
                            color="primary"
                            @click.prevent="saveRole(item.id, item.roles[0].name)"
                        >
                            Save change
                        </VBtn>
                    </div>
                </template>
            </VDataTable>
        </VCard>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faUserPlus } from '@fortawesome/pro-solid-svg-icons'
import { FloatingBannerEnum } from '~/types/banner'

export default Vue.extend({
    name: 'ManageUsers',
    components: { FontAwesomeIcon },

    data() {
        return {
            modifiedRoles: {} as Record<number, string>,

            dialog: false,
            search: '',
            headers: [
                {
                    text: 'Name',
                    align: 'start',
                    value: 'name',
                },
                { text: 'Email', value: 'email' },
                { text: 'Role', value: 'role', sortable: false },
                { text: '', value: 'save', sortable: false },
            ],

            invitationSent: false,
        }
    },

    async fetch(): Promise<void> {
        await this.$store.dispatch('iam/fetchUsers')
        await this.$store.dispatch('iam/fetchRoles')
    },

    computed: {
        ...mapGetters('iam', ['getUsers', 'getRoles', 'getRolesNames']),

        icons(): Record<string, IconDefinition> {
            return {
                faUserPlus,
            }
        },

        roleSelectItems(): string[] {
            return this.getRoles.map(({ name }) => name)
        },

        superAdminEmail(): String {
            const superadmin = this.$accessor.tenant.getSuperadmin
            return superadmin.email
        },
    },

    methods: {
        selectRole(id: number, e: any): void {
            Vue.set(this.modifiedRoles, id, e)
        },

        async saveRole(userId: number, lastRole: string): Promise<void> {
            const userIndex = this.getUsers.findIndex((user) => user.id === userId)

            const user = this.getUsers[userIndex]

            try {
                if (lastRole !== this.modifiedRoles[userId]) {
                    const role = await this.$axios.$get(`/iam/roles/${this.modifiedRoles[userId]}`)

                    await this.$axios.$patch('/iam/users/role', {
                        userId,
                        roleId: role.id,
                    })

                    this.$accessor.banner.setBannerWithTimeout({
                        value: true,
                        type: FloatingBannerEnum.success,
                        message: `Role of user "${user?.firstName} ${user?.lastName}" was changed successfully to ${role.name}`,
                    })

                    Vue.delete(this.modifiedRoles, userId)

                    this.$store.commit('iam/updateRoleOfUser', {
                        index: userIndex,
                        role,
                    })
                }
            } catch (error) {
                this.$accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.error,
                    message: `There was an error when changing the role of user "${user?.firstName} ${user?.lastName}"`,
                })
            }
        },
        sentMoreInvitations() {
            this.invitationSent = false
        },

        closeDialog() {
            this.dialog = false

            this.invitationSent = false
        },
    },
})
</script>

<style scoped></style>
