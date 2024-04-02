<template>
    <VContainer>
        <VBtn color="primary" @click="createTask">Create Task</VBtn>
        <VBtn color="primary" @click="updateTask">Update Task</VBtn>
        <VBtn color="primary" @click="findOneTask">Find one Task</VBtn>
    </VContainer>
</template>

<script lang="ts">
/* eslint-disable no-console */
import { defineComponent, useContext } from '@nuxtjs/composition-api'
import axios from 'axios'
import { CreateTaskDto, UpdateTaskDto } from '~/sdk/api'
import { ProjectVisibilityEnum } from '~/types/entities/ProjectVisibility.entity'

// TODO: Delete me after kanban board is finished
export default defineComponent({
    name: 'BoardSdkTest',
    auth: false,
    setup() {
        const { $api } = useContext()

        async function createTask() {
            try {
                const data: CreateTaskDto = {
                    title: 'Title',
                    description: 'description',
                    statusId: 1,
                    board: {
                        id: 1,
                        tenantId: 1,
                        project: {
                            visibility: ProjectVisibilityEnum.PUBLIC,
                            workspaceId: 1,
                        },
                    },
                }
                await $api.tasks.createTask({
                    createTaskDto: data,
                })

                const formData = new FormData()
                formData.append('data', JSON.stringify(data))
                // await $axios.$post('/tasks', formData)
            } catch (e) {
                if (axios.isAxiosError(e)) {
                    console.log('Error Response Data: ', e.response?.data)
                    console.log('Error Response Status: ', e.response?.status)
                }
            }
        }

        async function findOneTask() {
            console.error('createTask')
            try {
                // Data should be of the type returned by the controller
                const { data } = await $api.tasks.findOneTask({
                    id: '1',
                })
                console.log(data)
            } catch (e) {
                if (axios.isAxiosError(e)) {
                    console.log('Error Response Data: ', e.response?.data)
                    console.log('Error Response Status: ', e.response?.status)
                }
            }
        }

        async function updateTask() {
            console.error('createTask')
            try {
                // Now we know the arguments of our APIs!!
                const dto: UpdateTaskDto = {
                    title: 'Update title',
                }

                // Data should be of the type returned by the controller
                const { data } = await $api.tasks.updateTask({
                    id: 1,
                    updateTaskDto: dto,
                })

                console.log(data)
            } catch (e) {
                if (axios.isAxiosError(e)) {
                    console.log('Error Response Data: ', e.response?.data)
                    console.log('Error Response Status: ', e.response?.status)
                }
            }
        }

        return {
            createTask,
            updateTask,
            findOneTask,
        }
    },
})
</script>

<style scoped></style>
