<template>
    <div data-cy="VProfileImage">
        <img
            v-if="user.avatar"
            class="tw-bg-gray-300 tw-rounded-full tw-flex-shrink-0"
            :src="user.avatar.location"
            :class="size"
            :alt="user.firstName + ' ' + user.lastName"
        />
        <span
            v-else
            class="tw-inline-flex tw-items-center tw-justify-center tw-rounded-full"
            :class="size"
            :style="`background-color: ${background(user.firstName, user.lastName)}`"
        >
            <span
                class="tw-font-medium tw-leading-none tw-text-white tw-tracking-tighter"
                :class="textSize"
            >
                {{ initials }}
            </span>
        </span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { PropType } from '@nuxtjs/composition-api'
import { User } from '~/types/entities/User.entity'

// TODO: Bad use of enum. Refactor to object literal. Enum's KEY should equal VALUE
export enum EVProfileImageSize {
    xxs = 'tw-h-4 tw-w-4',
    xs = 'tw-h-6 tw-w-6',
    sm = 'tw-h-8 tw-w-8',
    md = 'tw-h-10 tw-w-10',
    lg = 'tw-h-12 tw-w-12',
    xl = 'tw-h-14 tw-w-14',
    xxl = 'tw-h-16 tw-w-16',
    xxxl = 'tw-h-18 tw-w-18',
    xxxxl = 'tw-h-20 tw-w-20',
}
export default Vue.extend({
    name: 'VProfileImage',
    props: {
        user: {
            type: Object as PropType<User>,
            default: () => {
                return { firstName: 'Poster', lastName: 'Lab', avatar: '' }
            },
        },
        size: {
            type: String,
            default: EVProfileImageSize.md,
            validator(val) {
                return Object.values(EVProfileImageSize).includes(val as EVProfileImageSize)
            },
        },
    },
    computed: {
        initials(): string {
            return `${this.user.firstName[0].toUpperCase()} ${this.user.lastName[0].toUpperCase()}`
        },
        textSize(): Record<string, boolean> {
            return {
                [this.size === EVProfileImageSize.xxs ? 'tw-text-xxxs' : '']: true,
                [this.size === EVProfileImageSize.xs ? 'tw-text-xxs' : '']: true,
                [this.size === EVProfileImageSize.sm ? 'tw-text-xs' : '']: true,
                [this.size === EVProfileImageSize.md ? 'tw-text-sm' : '']: true,
                [this.size === EVProfileImageSize.lg ? 'tw-text-base' : '']: true,
                [this.size === EVProfileImageSize.xl ? 'tw-text-lg' : '']: true,
                [this.size === EVProfileImageSize.xxl ? 'tw-text-xl' : '']: true,
                [this.size === EVProfileImageSize.xxxl ? 'tw-text-2xl' : '']: true,
                [this.size === EVProfileImageSize.xxxxl ? 'tw-text-3xl' : '']: true,
            }
        },
    },
    methods: {
        background(firstName: string, lastName: string): string {
            let hash: number = 0
            const fullName: string = `${firstName} ${lastName}`
            const saturation: number = 30
            const lightness: number = 80
            for (let i = 0; i < fullName.length; i++) {
                hash = fullName.charCodeAt(i) + ((hash << 5) - hash)
            }
            const hue: number = hash % 360
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`
        },
    },
})
</script>
