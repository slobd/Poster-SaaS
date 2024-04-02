<template>
    <div class="tw-grid tw-grid-cols-12 tw-gap-6">
        <UserCard v-if="manager" :position="position" :user="manager" class="card-wrap" />
        <UserCard v-for="(user, i) in users" :key="i" :user="user" class="card-wrap" />
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { faArrowRight } from '@fortawesome/pro-solid-svg-icons'
import { IExpert } from '~/types/experts'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    name: 'UsersGrid',
    props: {
        users: {
            type: Array as PropType<IExpert[]>,
            default: () => [] as IExpert[],
            required: true,
        },
        manager: {
            type: Object as PropType<IExpert>,
        },
        position: {
            type: String,
            default: '',
        },
    },
    setup() {
        const { icons } = useIcons({ faArrowRight })
        return { icons }
    },
})
</script>

<style scoped>
.card-wrap {
    @apply tw-col-span-12 md:tw-col-span-6 lg:tw-col-span-4 2xl:tw-col-span-3;
}
</style>
