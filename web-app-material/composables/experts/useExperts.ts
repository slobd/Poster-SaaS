import { ref, computed, useContext } from '@nuxtjs/composition-api'
import { IExpert } from '~/types/experts'
import { ExpertSortOptions } from '~/constants/experts.constants'
import { APIRoutesV2 } from '~/types/typing'
import { Skill } from '~/types/entities/Skill.entity'

export default function useExperts() {
    // Register composables
    const { $auth, $axios } = useContext()

    // Data references
    const users = ref<IExpert[]>([])
    const search = ref('')
    const currentSorting = ref(ExpertSortOptions.ALL)

    const sortOptions = computed(() => [ExpertSortOptions.ALL, ExpertSortOptions.BEST_MATCHING])

    const searchedUsers = computed<typeof users.value>(() => {
        if (search.value) {
            const trimedValue = search.value.trim()
            return users.value.filter((user) => {
                const intValue = parseInt(trimedValue, 10)
                if (!isNaN(intValue)) {
                    return user.activity?.documents === intValue
                }

                return _isValueInUser(user, trimedValue)
            })
        } else return users.value
    })

    function _isValueInUser(user: any, val: string): boolean {
        const value = val.toLowerCase()
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
        return (
            fullName.includes(value) ||
            value.includes(fullName) ||
            user.keywords.some((keyword: string) => keyword.toLowerCase().includes(value)) ||
            user.topics.some((topic: string) => topic.toLowerCase().includes(value)) ||
            user.organizationName?.toLowerCase().includes(value) ||
            user.email?.toLowerCase().includes(value) ||
            user.currentPosition?.toLowerCase().includes(value) ||
            user.biography?.toLowerCase().includes(value) ||
            user.skills.some((skill: Skill) => skill.name.toLowerCase().includes(value))
        )
    }

    async function fetchUsers(workspaceId: number): Promise<void> {
        try {
            if (currentSorting.value === ExpertSortOptions.BEST_MATCHING && $auth.user.id) {
                await fetchRelateExperts(workspaceId, $auth.user.id)
            } else {
                users.value = await $axios.$get(APIRoutesV2.WORKSPACES_ID_PEOPLE(workspaceId))
            }
        } catch (e) {
            // TODO: Handle error
            users.value = []
        }
    }

    // Use in experts-related
    async function fetchRelateExperts(workspaceId: number, userId: number) {
        try {
            users.value = await $axios.$get(
                APIRoutesV2.WORKSPACES_ID_RECOMMENDED_ID(workspaceId, userId)
            )
            _removeUser(userId)
        } catch (error) {
            users.value = [] as IExpert[]
        }
    }

    function _removeUser(id: Number) {
        const indexOfCurrentUser = users.value.findIndex((user) => user.id === id)
        if (indexOfCurrentUser !== -1) {
            users.value.splice(indexOfCurrentUser, 1)
        }
    }

    return {
        // Reactive
        users,
        search,
        currentSorting,
        // Computed
        sortOptions,
        searchedUsers,
        // Method
        fetchUsers,
        fetchRelateExperts,
    }
}
