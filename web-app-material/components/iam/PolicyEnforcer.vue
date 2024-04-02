<script>
import Vue from 'vue'
import { Resources, ResourcesAndActions } from '~/types/iam'
import { APIRoutes } from '~/types/typing'
export default Vue.extend({
    props: {
        permission: {
            type: Object,
            required: true,
            validator(value) {
                return (
                    'resource' in value &&
                    value.resource in Resources &&
                    'action' in value &&
                    value.action in ResourcesAndActions[value.resource]
                )
            },
        },
        resourceId: {
            type: [String, Number],
            default: null,
        },
    },
    data() {
        return {
            allow: null,
        }
    },
    async mounted() {
        try {
            const canUser = await this.$axios.$post(APIRoutes.IAM_CAN_USER, {
                resource: this.permission.resource,
                resourceId: this.resourceId,
                action: this.permission.action,
            })

            // eslint-disable-next-line no-constant-condition
            if (process.env.nodeEnv === 'development')
                // eslint-disable-next-line no-console
                console.log(
                    'PolicyEnforcer',
                    this.permission.resource,
                    this.permission.action,
                    this.resourceId,
                    canUser
                )
            this.allow = canUser
        } catch (error) {
            this.allow = false
        }
    },
    render(createElement) {
        if (this.$scopedSlots.default) {
            return this.$scopedSlots.default({
                allow: this.allow,
            })
        } else {
            return createElement('div')
        }
    },
})
</script>
