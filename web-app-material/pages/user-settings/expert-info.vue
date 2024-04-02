<template>
    <div class="tw-max-w-xl">
        <ValidationObserver v-slot="{ handleSubmit }" ref="observer" slim>
            <VeeTextField
                v-model="form.currentPosition"
                :label="'Current Position'"
                :height="'55'"
                :outlined="'outlined'"
                :counter="'200'"
                :rules="'max:200'"
                :name="'position'"
            >
            </VeeTextField>

            <VeeCombobox
                v-model="form.skills"
                class="user-skills"
                :label="'My skills'"
                :height="'100'"
                :outlined="'outlined'"
                :multiple="'multiple'"
                :counter="'8'"
                :hint="'Up to 8 skills'"
                :persistent-hint="true"
                :items="definedSkills"
                @input="skillUpdate()"
            >
            </VeeCombobox>

            <VeeTextarea
                v-model="form.biography"
                :label="'Biography'"
                :outlined="'outlined'"
                :counter="'600'"
                :rules="'max:600'"
                :name="'biography'"
            >
            </VeeTextarea>

            <VBtn color="primary" depressed @click.prevent="handleSubmit(saveInfoChanges)">
                Save changes
            </VBtn>
        </ValidationObserver>
    </div>
</template>

<script lang="ts">
import { mapActions } from 'vuex'
import { defineComponent } from '@nuxtjs/composition-api'
import { ValidationObserver } from 'vee-validate'
import { definedSkills } from './defined-skills'
import useUtils from '~/composables/common/useUtils'
import { FloatingBannerEnum } from '~/types/banner'
import { User } from '~/types/entities/User.entity'
import { Skill } from '~/types/entities/Skill.entity'

export default defineComponent({
    setup() {
        const { removeEmptyKeyFromObject } = useUtils()

        return {
            definedSkills,
            removeEmptyKeyFromObject,
        }
    },
    data() {
        return {
            form: {
                currentPosition: this.$auth.user.currentPosition
                    ? this.$auth.user.currentPosition
                    : '',
                skills: this.$auth.user.skills
                    ? this.$auth.user.skills.map((item: Skill) => {
                          return {
                              text: item.name,
                          }
                      })
                    : [],
                biography: this.$auth.user.biography ? this.$auth.user.biography : '',
            },
        }
    },
    methods: {
        ...mapActions('myprofile', ['updateProfile']),

        convertSkillListForVeeCombobox(skillList: Skill[]): any[] {
            return skillList
                ? skillList.map((item: Skill) => {
                      return {
                          text: item.name,
                      }
                  })
                : []
        },

        async saveInfoChanges(): Promise<void> {
            const _skills = this.form.skills.map((item) => {
                return {
                    name: item.text,
                }
            })
            try {
                await this.$accessor.myprofile.updateProfile({
                    user: {
                        currentPosition: this.form.currentPosition,
                        biography: this.form.biography,
                        skills: _skills,
                    } as User,
                })
                await this.$auth.fetchUser()
                this.$accessor.banner.setBannerWithTimeout({
                    value: true,
                    type: FloatingBannerEnum.success,
                    message: 'Profile updated successfully.',
                })
            } catch (error) {
                this.setErrorBanner(error, 'Error while saving')
            }
        },

        skillUpdate() {
            if (this.form.skills.length > 8) {
                this.$nextTick(() => this.form.skills.pop())
            }
        },

        setErrorBanner(error, message) {
            if (error.response && error.response.status === 400) {
                const observer = this.$refs.observer as InstanceType<typeof ValidationObserver>
                observer.setErrors(error.response.data.error)
            }

            this.$store.commit('setBanner', {
                type: FloatingBannerEnum.error,
                message,
                value: true,
            })
        },
    },
})
</script>
