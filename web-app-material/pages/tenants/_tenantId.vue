<template>
    <div class="tw-h-full tw-overflow-y-auto">
        <VContainer fluid>
            <div class="h-5">
                <h1 class="tw-text-lg sm:tw-text-2xl">{{ tenantTitle }} Settings</h1>
                <VSpacer />
            </div>
        </VContainer>
        <VDivider />
        <VContainer>
            <ValidationObserver ref="observer" v-slot="{ handleSubmit }" slim>
                <VRow>
                    <VCol md="6">
                        <h5 class="mb-4">GENERAL CUSTOMIZATION</h5>

                        <p>{{ tenantTitle }} name</p>
                        <VeeTextField
                            v-model="tenant.name"
                            rules="required"
                            vid="name"
                            name="name"
                            outlined
                        />

                        <p class="text-body-1">{{ tenantTitle }} subdomain</p>
                        <VTextField :value="tenant.host" disabled outlined />
                        <p class="text-subtitle-2">
                            Please
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://forms.clickup.com/f/heqhc-1901/R2AJ62RZFHX3WQF8AW"
                                >Contact us</a
                            >
                            to change your subdomain
                        </p>
                    </VCol>
                    <VCol md="6">
                        <VBtn :loading="loading" color="primary" @click="handleSubmit(submit)">
                            Save
                        </VBtn>
                    </VCol>
                </VRow>
            </ValidationObserver>
        </VContainer>
    </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref, useContext } from '@nuxtjs/composition-api'
import { ValidationObserver } from 'vee-validate'
import { Route } from 'vue-router/types'
import { Actions, Resources } from '~/types/iam'

export default defineComponent({
    middleware: ['auth'],
    
    meta: {
        permissions: (route: Route) => [[Resources.TENANT, route.params.tenantId, Actions.ADMIN]],
    },
    
    setup() {
        const { $accessor, $axios, $logger } = useContext()

        const observer = ref<InstanceType<typeof ValidationObserver> | null>(null)
        const loading = ref(false)
        const tenant = ref({
            name: $accessor.tenant.getTenantName,
            host: $accessor.tenant.getHost,
        })

        const tenantTitle = computed(() => 'Organization')

        async function submit() {
            loading.value = true
            try {
                const data: Record<string, any> = {}

                // Prevent unique constraints
                if (tenant.value.name !== $accessor.tenant.getTenantName)
                    data.name = tenant.value.name

                const response = await $axios.$patch(
                    `/tenants/${$accessor.tenant.getTenantId}`,
                    data
                )

                if (response) {
                    $accessor.tenant.setTenantName(tenant.value.name)
                    $accessor.tenant.setHost(tenant.value.host)
                }

                $accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: 'success',
                    message: 'Settings successfully updated',
                })
            } catch (error) {
                $logger.error(error)
                $accessor.banner.setBanner({
                    value: true,
                    type: 'error',
                    message: 'Error while updating settings',
                })
                if (error?.response?.data?.error) {
                    observer.value?.setErrors(error.response.data.error)
                }
            } finally {
                loading.value = false
            }
        }

        return {
            tenant,
            loading,
            observer,
            tenantTitle,
            submit,
        }
    },
})
</script>
