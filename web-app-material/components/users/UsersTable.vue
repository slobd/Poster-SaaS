<template>
    <VSimpleTable fixed-header dense>
        <template #default>
            <thead>
                <tr>
                    <th class="tw-text-left tw-w-20"></th>
                    <th class="tw-text-left tw-py-2 tw-px-1">NAME</th>
                    <th class="tw-text-left tw-py-2 tw-px-1">SKILLS</th>
                    <th class="tw-text-left tw-py-2 tw-px-1">ORGANIZATION</th>
                    <th class="tw-text-left tw-py-2 tw-px-1">TOPICS</th>
                    <th class="tw-text-left tw-py-2 tw-px-1">KEYWORDS</th>
                    <th class="tw-text-left tw-py-2 tw-px-1">WORKSPACE ACTIVITY</th>
                </tr>
            </thead>
            <tbody>
                <tr
                    v-for="(user, i) in users"
                    :key="i"
                    class="tw-text-sm tw-capitalize tw-cursor-pointer hover:tw-bg-pl-gray-2"
                    @click="
                        $router.push(
                            `/workspace/${$route.params.workspaceId}/users/${user.id}/profile`
                        )
                    "
                >
                    <td class="tw-py-2 tw-pl-4 tw-pr-1">
                        <ProfileImage :user="user" :size="56" />
                    </td>
                    <td class="tw-py-2 tw-px-1">
                        <p class="tw-text-lg tw-font-semibold tw-leading-6 tw-m-0">
                            {{ user.firstName + ' ' + user.lastName }}
                        </p>
                        <p class="tw-m-0">
                            {{ user.currentPosition ? user.currentPosition : '' }}
                        </p>
                        <div class="tw-flex tw-items-center">
                            <VTooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <VBtn
                                        v-if="user.linkedin"
                                        icon
                                        :href="user.linkedin"
                                        target="_blank"
                                        class="tw-ml-0"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <FontAwesomeIcon
                                            class="tw-mx-1 tw-text-xl tw-text-gray-500"
                                            :icon="icons.faLinkedin"
                                        />
                                    </VBtn>
                                </template>
                                <span>linkedin</span>
                            </VTooltip>
                            <VTooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <VBtn
                                        v-if="user.researchGate"
                                        icon
                                        :href="user.researchGate"
                                        target="_blank"
                                        class="tw-ml-0"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <FontAwesomeIcon
                                            class="tw-mx-1 tw-text-xl tw-text-gray-500"
                                            :icon="icons.faResearchgate"
                                        />
                                    </VBtn>
                                </template>
                                <span>researchGate</span>
                            </VTooltip>
                            <VTooltip bottom>
                                <template #activator="{ on, attrs }">
                                    <VBtn
                                        v-if="user.twitter"
                                        icon
                                        :href="user.twitter"
                                        target="_blank"
                                        class="tw-ml-0"
                                        v-bind="attrs"
                                        v-on="on"
                                    >
                                        <FontAwesomeIcon
                                            class="tw-mx-1 tw-text-xl tw-text-gray-500"
                                            :icon="icons.faTwitter"
                                        />
                                    </VBtn>
                                </template>
                                <span>twitter</span>
                            </VTooltip>
                        </div>
                    </td>
                    <td class="tw-py-2 tw-px-1 tw-w-2/12">
                        <p class="tw-m-0">
                            <VChip
                                v-for="(skill, index) in user && user.skills.slice(0, 4)"
                                :key="`${index}-skill-${skill}`"
                                :ripple="false"
                                label
                                color="lighten-4"
                                class="tw-mr-1 tw-mb-1 tw-border-0 tw-bg-transparent"
                                small
                            >
                                <VBtn
                                    class="tw-cursor-pointer"
                                    @click.stop="selectSkill(skill.name)"
                                >
                                    {{ skill.name }}
                                </VBtn>
                            </VChip>
                        </p>
                    </td>
                    <td class="tw-py-2 tw-px-1">
                        <p class="tw-m-0">
                            {{ user.organizationName ? user.organizationName : '' }}
                        </p>
                    </td>
                    <td class="tw-py-2 tw-px-1">
                        <p class="tw-m-0">
                            {{ user.topics ? user.topics.join(', ') : '' }}
                        </p>
                    </td>
                    <td class="tw-py-2 tw-px-1">
                        <p class="tw-m-0">
                            {{
                                user.keywords && user.keywords.length
                                    ? user.keywords.slice(0, 5).join(', ')
                                    : ''
                            }}
                        </p>
                    </td>
                    <td class="tw-py-2 tw-px-1">
                        <p>
                            {{ user.activity && user.activity.documents }}&nbsp;{{
                                user.activity.documents > 1 ? 'Documents' : 'Document'
                            }}
                        </p>
                    </td>
                </tr>
            </tbody>
        </template>
    </VSimpleTable>
</template>

<script lang="ts">
import { faLinkedin, faResearchgate, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { IExpert } from '~/types/experts'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'UsersTable',
    props: {
        users: {
            type: Array as PropType<IExpert[]>,
            default: () => [] as IExpert[],
            required: true,
        },
    },
    setup(_, { emit }) {
        const { icons } = useIcons({
            faLinkedin,
            faResearchgate,
            faTwitter,
            faChevronRight,
        })

        function selectSkill(skill: string) {
            emit('setSearch', skill)
        }

        return {
            icons,
            selectSkill,
        }
    },
})
</script>

<style></style>
