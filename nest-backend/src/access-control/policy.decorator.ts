import { CustomDecorator, SetMetadata } from '@nestjs/common'
import { ActionEnum, SubjectEnum } from '@/access-control/access-control.types'

export type PolicyParams = {
    // Subject to evaluate for this route
    subject: SubjectEnum
    // Action that is acted upon the Subject of this route
    action: ActionEnum
    // When false if the action is "List", the policy enforcer won't enforce Read action permission for every entity
    evaluateReadForListAction?: boolean
    // Information provider configuration
    informationProvider?: {
        // Selects the information provider when evaluating "List" actions
        entity?: SubjectEnum
        // Route param used as unique identifier for the Information Provider
        identifier?: string
    }
}

export const Policy = ({
    subject,
    action,
    evaluateReadForListAction = true,
    informationProvider,
}: PolicyParams): CustomDecorator =>
    SetMetadata('policy', {
        subject,
        action,
        evaluateReadForListAction,
        informationProvider,
    })
