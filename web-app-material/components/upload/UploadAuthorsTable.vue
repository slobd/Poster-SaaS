<template>
    <VSimpleTable class="tw-text-left">
        <template #default>
            <thead>
                <tr>
                    <th class="text-left">NAME</th>
                    <th class="text-left">E-MAIL</th>
                    <th class="text-left">ORGANIZATION</th>
                    <th class="text-left">ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(author, i) in authors" :key="author.firstName + ' ' + author.lastName">
                    <td>
                        <VAvatar color="primary" size="36" class="tw-mr-1">
                            <img
                                v-if="author.avatar"
                                :src="author.avatar.location"
                                alt=""
                                class="tw-object-cover"
                            />
                            <span v-else class="white--text">{{
                                author.firstName[0].toUpperCase() + author.lastName[0].toUpperCase()
                            }}</span>
                        </VAvatar>

                        {{ author.firstName + ' ' + author.lastName }}

                        <VChip v-if="i === 0" outlined color="primary" small class="tw-ml-1"
                            >{{ leadText }}
                        </VChip>
                    </td>
                    <td>{{ author.email }}</td>
                    <td>{{ author.organizationName }}</td>
                    <td>
                        <VBtn
                            v-if="i !== 0"
                            outlined
                            small
                            color="error"
                            @click="handleDelete(i, author)"
                            >Delete
                        </VBtn>
                    </td>
                </tr>
            </tbody>
        </template>
    </VSimpleTable>
</template>
<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { User } from '~/types/entities/User.entity'

export default defineComponent({
    name: 'UploadAuthorsTable',
    props: {
        authors: {
            type: Array as PropType<User[]>,
            default: () => [],
        },
        leadText: {
            type: String,
            default: 'Lead Author',
        },
    },
    setup(_props, { emit }) {
        function handleDelete(index, author) {
            emit('remove-user', author)
            emit('remove-member', index)
        }

        return {
            handleDelete,
        }
    },
})
</script>
