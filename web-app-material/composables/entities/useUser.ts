import { User } from '~/types/entities/User.entity'

export default function useUser() {
    function getFullName(user: Pick<User, 'firstName' | 'lastName'>) {
        return `${user.firstName} ${user.lastName}`
    }

    return {
        getFullName,
    }
}
