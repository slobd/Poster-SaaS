<template>
    <VRow dense>
        <VCol cols="12">
            <VMenu
                v-model="menu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
                :close-on-click="false"
            >
                <template #activator="{ on, attrs }">
                    <VTextField
                        :value="dateRangeText"
                        prepend-icon="mdi-calendar"
                        readonly
                        :error-messages="errors"
                        v-bind="attrs"
                        outlined
                        v-on="on"
                    ></VTextField>
                </template>
                <VDatePicker v-model="dates" no-title :min="today" range>
                    <VSpacer></VSpacer>
                    <VBtn text color="primary" @click="cancel"> Cancel</VBtn>
                    <VBtn color="primary" @click="submit"> OK</VBtn>
                </VDatePicker>
            </VMenu>
        </VCol>
        <VSpacer></VSpacer>
    </VRow>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
    name: 'MultiDatePicker',
    props: {
        value: {
            type: Array as PropType<string[]>,
            required: true,
        },
        errors: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { emit }) {
        // Refs
        const { value } = props

        const dates = ref(value)
        const menu = ref(false)

        // Computed

        // Minimum Date
        const today = computed(() => {
            const currentDate = new Date()

            function _getDay(currentDate: Date): string {
                return currentDate.getDate() >= 10
                    ? currentDate.getDate().toString()
                    : '0' + currentDate.getDate()
            }

            return `${currentDate.getFullYear()}-${currentDate.getUTCMonth() + 1}-${_getDay(
                currentDate
            )}`
        })

        const dateRangeText = computed(() =>
            dates.value
                .map((x) => {
                    const date = new Date(x)
                    return (
                        date.getDate() +
                        ' ' +
                        date.toLocaleString('default', { month: 'short' }) +
                        ' ' +
                        date.getFullYear()
                    )
                })
                .join(' - ')
        )

        // Methods
        function submit() {
            emit('input', dates.value)
            menu.value = false
        }

        function cancel() {
            dates.value = value
            menu.value = false
        }

        return {
            menu,
            today,
            dates,
            // computed
            dateRangeText,
            // methods
            submit,
            cancel,
        }
    },
})
</script>

<style></style>
