<template>
    <div>
        <VBtn
            v-if="!editMode"
            :color="focus ? 'primary' : 'default'"
            block
            :disabled="disabled"
            :outlined="!focus"
            @click.prevent="onClickEvent"
        >
            <span class="tw-flex tw-justify-between tw-min-w-0 tw-w-full">
                <span class="tw-truncate">
                    {{ name }}
                </span>
                <span class="tw-whitespace-nowrap">
                    <FontAwesomeIcon
                        :icon="icons.faPen"
                        title="Edit block title"
                        fixed-width
                        size="sm"
                        @click.stop="editMode = true"
                    />
                    <FontAwesomeIcon
                        :icon="icons.faTimesCircle"
                        title="Delete block"
                        fixed-width
                        size="sm"
                        @click.stop="removeBlock({ index })"
                    />
                </span>
            </span>
        </VBtn>
        <VTextField
            v-if="editMode"
            placeholder="Enter block name"
            class="tw-mx-1"
            block
            dense
            :maxlength="20"
            name="block"
            :disabled="disabled"
            :value="name"
            @input="
                updateBlockName({
                    index,
                    name: $event,
                })
            "
            @keyup.enter="onSubmit"
            @blur="onSubmit"
        >
            <template #append>
                <FontAwesomeIcon
                    size="sm"
                    class="tw-text-gray-700 tw-cursor-pointer"
                    :icon="icons.faSave"
                    @click.stop="onSubmit"
                />
            </template>
        </VTextField>
    </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { mapMutations } from 'vuex'
import { faSave, faTimesCircle } from '@fortawesome/pro-solid-svg-icons'
import { faPen } from '@fortawesome/pro-regular-svg-icons'
import useIcons from '~/composables/common/useIcons'

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true,
        },
        index: {
            type: Number,
            required: true,
        },
        focus: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup() {
        const { icons } = useIcons({
            faSave,
            faTimesCircle,
            faPen,
        })

        return {
            icons,
        }
    },
    data() {
        return {
            editMode: false,
        }
    },
    mounted() {
        if (!this.name) this.editMode = true
    },
    methods: {
        ...mapMutations('canvas', ['removeBlock', 'updateBlockName']),
        onClickEvent() {
            this.$emit('set-index')
        },
        onSubmit() {
            this.editMode = false
            this.$emit('set-index')
        },
    },
})
</script>
