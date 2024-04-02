import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
    UnauthorizedException,
} from '@nestjs/common'
import { catchError, map, Observable, pipe, throwError } from 'rxjs'
import {
    ActionEnum,
    createAbility,
    RawRuleWithFeature,
} from '@/access-control/access-control.types'
import { Reflector } from '@nestjs/core'
import { Ability, ForcedSubject, subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { cloneDeep, difference, pick } from 'lodash'
import { RulesService } from '@/access-control/rules/rules.service'
import { PolicyInformationPointService } from '@/access-control/policy-information-point.service'
import { Request } from 'express'
import { Tenant } from '@/tenant/entities/tenant.entity'
import { PolicyParams } from '@/access-control/policy.decorator'
import { BaseClass } from '@/utils/shared/base-class'
import { IncomingHttpHeaders } from 'http'

const TYPE_FIELD = '__caslSubjectType__'

export function setSubjectType<
    T extends string,
    U extends Record<PropertyKey, any>,
>(type: T, object: U): U & ForcedSubject<T> {
    if (object) {
        if (!Object.prototype.hasOwnProperty.bind(object)(TYPE_FIELD)) {
            Object.defineProperty(object, TYPE_FIELD, { value: type })
        } else if (type !== object[TYPE_FIELD]) {
            throw new Error(
                `Trying to cast object to subject type ${type} but previously it was casted to ${object[TYPE_FIELD]}`,
            )
        }
    }

    return object as U & ForcedSubject<T>
}

@Injectable()
export class PolicyEnforcementPointInterceptor
    extends BaseClass
    implements NestInterceptor
{
    // private subj: SubjectEnum
    // private action: ActionEnum
    private tenant: Tenant
    private method: string
    private ability: Ability
    // private evaluateReadForListAction = true
    // private informationProvider: SubjectEnum
    private body: any
    private metadata: PolicyParams
    private headers: IncomingHttpHeaders

    constructor(
        private readonly reflector: Reflector,
        private readonly rulesService: RulesService,
        private readonly PIPService: PolicyInformationPointService,
    ) {
        super()
    }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        // Get the subject from the method metadata
        const metadata = this.getMetadata(context)

        if (!metadata?.subject || !metadata?.action) return next.handle()

        // console.log('--------- AccessControlInterceptor - before ---------')

        const req: Request = context.switchToHttp().getRequest()

        if (!req.user)
            throw new UnauthorizedException(
                'You need to be authenticated to make this request',
            )

        this.metadata = metadata
        this.method = req.method
        this.headers = req.headers
        this.tenant = req.tenant
        this.body = req.body

        const enabledRules = await this.getRulesFromEnabledFeatures(req)

        this.ability = createAbility(enabledRules)

        /**
         * The entity that is passed to the Policy Decision Point (Casl)
         * varies depending on the Request method and the Action the user wants to execute
         */
        const data = await this.getSubjectEntity(req.params)

        this.requestPolicyEnforcement(data)

        /**
         * Post validation is only necessary to actions that fetches/find/get an entity (or many entities)
         */
        return next.handle().pipe(
            /**
             * Validates that the user can fetch the given entity
             * and remove fields that the user is not allowed to see
             */
            this.responsePolicyEnforcement(),
        )
    }

    private getMetadata(context: ExecutionContext): PolicyParams {
        return this.reflector.get<PolicyParams>('policy', context.getHandler())
    }

    private async getRulesFromEnabledFeatures(req: Express.Request) {
        const features = req.tenant.features
        const user = req.user
        const tenant = req.tenant

        // Get the abilities of the user from the request
        const rules: RawRuleWithFeature[] =
            await this.rulesService.findAllRawRulesOfUser({
                userId: user.id,
                tenantId: tenant.id,
            })

        const enabledRules = rules.filter((r) => features[r.feature])

        return enabledRules
    }

    private async getSubjectEntity(params) {
        let data
        if (['DELETE', 'PATCH', 'PUT'].includes(this.method)) {
            data = await this.getSubjectEntityFromPIP(params)
        } else if (['POST'].includes(this.method)) {
            data = this.getBodyBasedOnContentType()
        } else if (
            this.method === 'GET' &&
            this.metadata.action === ActionEnum.list
        ) {
            data = this.metadata?.informationProvider?.entity
                ? await this.getSubjectEntityFromPIP(params)
                : this.tenant
        }

        return data
    }

    private getBodyBasedOnContentType() {
        if (this.headers['content-type']?.includes('multipart/form-data')) {
            /**
             * For PATCH statements
             *  - validate the fields of the body
             *  - validate using the PIP
             */
            if (this.method === 'POST' && !this.body.data) {
                throw new BadRequestException(
                    'multipart/form-data must include the entity in the data property',
                )
            }

            if (this.method === 'POST' && this.body.data) {
                return cloneDeep(JSON.parse(this.body.data))
            }

            return undefined
        } else {
            return this.body
        }
    }

    private async getSubjectEntityFromPIP(params) {
        const uniqueId = this.metadata.informationProvider?.identifier
            ? parseInt(params[this.metadata.informationProvider.identifier])
            : parseInt(params.id)

        const resource =
            this.metadata.informationProvider?.entity || this.metadata.subject

        if (!uniqueId)
            throw new InternalServerErrorException(
                'No param id to identify the resource to be deleted',
            )
        return this.PIPService.findUniqueResource(uniqueId, resource)
    }

    private requestPolicyEnforcement(data) {
        /**
         * Deleting, Creating, Updating and Listing (fetching many entities)
         * are validated before the request reach the route handler
         */
        if (
            ['DELETE', 'POST', 'PATCH', 'PUT'].includes(this.method) ||
            (this.method === 'GET' && this.metadata.action === ActionEnum.list)
        ) {
            this.evaluateRule(data)
        }

        /**
         * For Creating and Updating we validate the body of the request
         */
        if (['POST', 'PATCH', 'PUT'].includes(this.method)) {
            this.validateRequestFields()
        }
    }

    private validateRequestFields() {
        const body = this.getBodyBasedOnContentType()

        // Body can be empty for PATCH request that upload files
        // e.g /tasks/:taskId/uploads
        // e.g /projects/:taskId/uploads
        if (!body) return

        const bodyFields = Object.keys(body)

        const permittedFields = this.getPermittedFields(body)

        if (permittedFields.length > 0) {
            // Validate fields
            const notAllowedFields = difference(bodyFields, permittedFields)

            // Either throw Forbidden or just remove it from the body
            if (notAllowedFields.length > 0) {
                throw new ForbiddenException(
                    `The user is not allowed to ${
                        this.method === 'POST'
                            ? 'create an entity with'
                            : 'update'
                    } the following fields ${notAllowedFields.join(', ')}`,
                )
            }
        }
    }

    private responsePolicyEnforcement() {
        // console.log('--------- AccessControlInterceptor - after ---------')
        return pipe(
            map((data) => {
                if (this.method !== 'GET') return data

                return this.validateResponse(data)
            }),
            // Needed because of how rxjs works. Catches the ForbiddenError
            catchError((err) => throwError(() => err)),
            // Remove the fields that the user can NOT see
            map((data) => {
                if (this.method !== 'GET') return data

                return this.removeDisallowedFieldsFromResponse(data)
            }),
        )
    }

    private validateResponse(data) {
        if (Array.isArray(data)) {
            /**
             * When fetching multiple entities we require the "list" action in order to access the findMany endpoint,
             * but we still need to evaluate for each entity if the user can "read" it
             */
            // action MUST be list
            if (
                this.metadata.action === ActionEnum.list &&
                !this.metadata.evaluateReadForListAction
            )
                return data

            const perEntityAction =
                this.metadata.action === ActionEnum.list
                    ? ActionEnum.read
                    : undefined

            data.forEach((d) => this.evaluateRule(d, perEntityAction))

            return data
        }

        if (typeof data === 'object') this.evaluateRule(data)

        return data
    }

    private removeDisallowedFieldsFromResponse<B>(data: B | (B & any[])) {
        if (Array.isArray(data)) {
            return data.map((d) => this.omitForbiddenFields(d))
        }

        if (typeof data === 'object') {
            return this.omitForbiddenFields(data)
        }

        return data
    }

    private omitForbiddenFields(data: any) {
        const fields = this.getPermittedFields(data)
        return fields?.length > 0 ? pick(data, fields) : data
    }

    private getPermittedFields(data: any) {
        return permittedFieldsOf(
            this.ability,
            this.metadata.action,
            subject(this.metadata.subject, data),
            { fieldsFrom: (rule) => rule.fields || [] },
        )
    }

    private evaluateRule(data, action?: ActionEnum) {
        const act = action ?? this.metadata.action

        const can = this.ability.can(act, subject(this.metadata.subject, data))
        //console.log('act: ', act, subject(this.metadata.subject, data))
        // Useful to check which rule was relevant for the decision
        // console.log(
        //     'relevantRuleFor',
        //     this.ability.relevantRuleFor(
        //         this.metadata.action,
        //         subject(this.metadata.subject, data),
        //     ),
        // )
        //console.log('can', can)
        if (!can) {
            throw new ForbiddenException(
                `Action "${act}" on resource "${this.metadata.subject}" with id ${data?.id} is not allowed`,
            )
        }
    }
}
