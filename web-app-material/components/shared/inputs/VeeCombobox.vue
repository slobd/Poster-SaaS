<template>
    <ValidationProvider v-slot="vp" :name="label" :vid="vid" :rules="rules" slim>
        <VCombobox
            hide-selected
            :value="value"
            :label="label"
            :small-chips="smallChips"
            :multiple="multiple"
            :outlined="outlined"
            :error-messages="vp.errors"
            :hide-details="hideDetails"
            :hint="hint"
            :persistent-hint="persistentHint"
            :counter="counter"
            :items="itemList"
            :height="height"
            @input="tagInput($event)"
            @change="change"
        >
            <template #selection="{ attrs, item, parent, selected }">
                <VChip
                    v-if="item === Object(item)"
                    v-bind="attrs"
                    color="tw-indigo-300"
                    :input-value="selected"
                    label
                    small
                >
                    <span class="pr-2">
                        {{ item.text }}
                    </span>
                    <VIcon small @click="parent.selectItem(item)"> $delete </VIcon>
                </VChip>
            </template>
        </VCombobox>
    </ValidationProvider>
</template>

<script lang="ts">
import { defineComponent, ref } from '@nuxtjs/composition-api'
import { sharedInputProps, veeValidateProps } from '~/components/shared/inputs/VeeInputsProps'

export default defineComponent({
    name: 'VeeCombobox',
    props: {
        value: {
            type: Array,
            default: () => [],
        },
        items: {
            type: Array,
            default: () => [],
        },
        smallChips: {
            type: Boolean,
            default: false,
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        ...sharedInputProps,
        ...veeValidateProps,
    },
    setup(props, { emit }) {
        const selectedList = ref(props.value)
        const itemList = ref(props.items)

        function tagInput(tag) {
            // check for duplicates. Insert only if unique
            if (!props.value.includes(tag[tag.length - 1]))
                if (tag && tag[tag.length - 1] && typeof tag[tag.length - 1] === 'string') {
                    // eslint-disable-next-line vue/no-mutating-props
                    props.value.push(tag[tag.length - 1])
                }
        }

        function deleteTag(tag) {
            emit(
                'delete',
                props.value.filter((x) => x !== tag)
            )
        }

        const change = (selected) => {
            selectedList.value = selected.map((v) => {
                if (typeof v === 'string') {
                    v = {
                        text: v,
                    }
                }
                return v
            })
            emit('input', selectedList.value)
        }

        return {
            selectedList,
            itemList,
            tagInput,
            deleteTag,
            change,
        }
    },
})
</script>
