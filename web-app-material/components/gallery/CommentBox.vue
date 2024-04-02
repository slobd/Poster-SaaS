<template>
    <div>
        <span>
            <h4>COMMENTS</h4>
        </span>
        <VTextarea
            v-model="newComment"
            filled
            auto-grow
            rows="1"
            class="tw-pt-3"
            placeholder="Write a comment"
            hide-details="auto"
            @keydown.enter="submitComment"
        >
        </VTextarea>
        <div class="tw-flex tw-p-2 tw-justify-end">
            <VBtn color="primary" small @click="submitComment">
                <FontAwesomeIcon
                    class="tw-mr-1 tw-cursor-pointer"
                    size="lg"
                    :icon="icons.faPaperPlane"
                />
                send
            </VBtn>
        </div>
        <VResponsive :aspect-ratio="16 / 6">
            <VRow>
                <VCol class="tw-overflow-y-scroll tw-pl-6" style="height: 500px">
                    <div
                        v-for="(comment, index) in comments"
                        :key="index"
                        :class="['tw-flex tw-items-center tw-m-2']"
                    >
                        <VAvatar
                            :color="
                                currentPoster.user && comment.user.id === currentPoster.user.id
                                    ? 'indigo'
                                    : 'red'
                            "
                            size="36"
                        >
                            <img
                                v-if="comment.user.avatar"
                                :src="comment.user.avatar.location"
                                alt=""
                                class="tw-object-cover"
                            />
                            <span v-else class="white--text">{{
                                comment.user.firstName[0].toUpperCase() +
                                comment.user.lastName[0].toUpperCase()
                            }}</span>
                        </VAvatar>
                        <VCard class="black--text tw-ml-3 tw-p-2 text-start">
                            <div class="tw-flex tw-justify-between">
                                <div class="tw-mr-4 tw-text-xs tw-font-bold">
                                    {{ commentAuthorName(comment) }}
                                </div>
                                <div class="tw-text-xs tw-text-gray-500 tw-opacity-50">
                                    {{ formatDate(comment.createdAt) }}
                                </div>
                            </div>
                            {{ comment.content }}
                            <div>
                                <!--                                <VBtn
                                    v-if="comment.user.id === $auth.user.id || currentPoster.user.id === $auth.user.id"
                                    color="red"
                                    text
                                    small
                                    @click="removeComment(comment)"
                                >
                                    Delete
                                </VBtn>-->
                                <VBtn
                                    v-if="$ability.can('delete', subject('Comment', comment))"
                                    color="red"
                                    text
                                    small
                                    @click="removeComment(comment)"
                                >
                                    Delete
                                </VBtn>
                            </div>
                        </VCard>
                    </div>
                </VCol>
            </VRow>
        </VResponsive>
    </div>
</template>

<script lang="ts">
import { faPaperPlane } from '@fortawesome/pro-solid-svg-icons'
import {
    computed,
    defineComponent,
    ref,
    useContext,
    useFetch,
    useRoute,
} from '@nuxtjs/composition-api'
import { subject } from '@casl/ability'
import { UComment } from '~/types/comments'
import { APIRoutesV2 } from '~/types/typing'
import useIcons from '~/composables/common/useIcons'
export default defineComponent({
    setup() {
        const newComment = ref('')

        const { $accessor, $axios, $logger, $auth } = useContext()
        const $route = useRoute()
        const { icons } = useIcons({
            faPaperPlane,
        })

        // Computed
        const currentPoster = computed(() => {
            return $accessor.gallery.getPoster
        })

        const comments = computed(() => {
            return $accessor.comments?.getComments ? $accessor.comments.getComments : []
        })

        useFetch(async () => {
            await $accessor.comments.fetchComments({
                posterId: parseInt($route.value.params.posterId),
            })
        })

        const workspaceId = computed(() => {
            return $accessor.workspace.getWorkspaceId
        })

        // Methods

        function commentAuthorName(comment) {
            return comment.user.firstName + ' ' + comment.user.lastName
        }

        async function submitComment() {
            const posterId = parseInt($route.value.params.posterId, 10)
            const data: UComment = {
                author: $auth.user,
                posterId,
                content: newComment.value,
                workspace: {
                    id: workspaceId.value,
                    tenantId: $accessor.tenant.getTenantId,
                },
            }
            try {
                const poster = await $axios.$post(APIRoutesV2.POSTERS_ID_COMMENTS(posterId), data)
                $accessor.comments.addComment(poster)
                newComment.value = ''
            } catch (error) {
                $logger.error(error)
            }
        }
        async function removeComment(comment) {
            try {
                if (comment?.id) {
                    const posterId = parseInt($route.value.params.posterId, 10)
                    await $axios.$delete(
                        `${APIRoutesV2.POSTERS_ID_COMMENTS(posterId)}/${comment.id}`
                    )
                    $accessor.comments.removeComment(comment.id)
                }
            } catch (error) {
                $logger.error('Delete comments failed: ', error)
            }
        }

        function formatDate(date: Date) {
            const today = new Date(date)
            const dd = today.getDate()
            const mm = today.getMonth() + 1
            const yyyy = today.getFullYear()
            return `${dd}/${mm}/${yyyy}`
        }

        return {
            newComment,
            comments,
            icons,
            currentPoster,
            commentAuthorName,
            submitComment,
            removeComment,
            formatDate,
            subject,
        }
    },
})
</script>

<style></style>
