import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseAzureService } from '@/azure/base-azure.service'
import { User } from '@microsoft/microsoft-graph-types'

const userProperties = [
    'displayName',
    'identities',
    'mail',
    'otherMails',
    'givenName',
    'surname',
    'id',
    'userPrincipalName',
] as const

// Otherwise, TS will complain when passing the properties array to the client.api().select()
const selectArg = [...userProperties] as string[]

export type AzureUser = Pick<User, typeof userProperties[number]>

export type UpdateAzureUser = Pick<User, 'givenName' | 'surname'>

export type CreateAzureUser = Pick<
    User,
    | 'accountEnabled'
    | 'displayName'
    | 'passwordProfile'
    | 'identities'
    | 'givenName'
    | 'surname'
>

@Injectable()
export class AzureUserService extends BaseAzureService {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    constructor(private readonly configService: ConfigService) {
        super(configService)
    }

    async create(data: CreateAzureUser): Promise<AzureUser> {
        try {
            const azureUser = await this.client.api('/users').post(data)
            return this.findOneUser(azureUser.id)
        } catch (e) {
            console.log('Azure create error:')
            console.log(JSON.parse(e.body))
            throw new InternalServerErrorException(e)
        }
    }

    // https://docs.microsoft.com/en-us/graph/query-parameters#filter-parameter
    // https://github.com/microsoftgraph/msgraph-sdk-javascript/blob/dev/docs/QueryParameters.md#filter
    async findManyUsers(): Promise<AzureUser[]> {
        try {
            return await this.client.api('/users').select(selectArg).get()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findOneByEmail(email: string): Promise<AzureUser | null> {
        try {
            const issuer = this.configService.get('LOCAL_ACCOUNT_ISSUER')
            const users = await this.client
                .api('/users')
                .select(selectArg)
                .filter(
                    `identities/any(id:id/issuerAssignedId eq '${email}' and id/issuer eq '${issuer}.onmicrosoft.com')`,
                )
                .get()

            if (users.value.length > 0) {
                return users.value[0]
            } else {
                return null
            }
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async findOneUser(objectId: string): Promise<AzureUser> {
        try {
            return await this.client
                .api(`/users/${objectId}`)
                .select(selectArg)
                .get()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async update(objectId: string, data: UpdateAzureUser): Promise<AzureUser> {
        try {
            return await this.client.api(`/users/${objectId}`).update(data)
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async delete(objectId: string): Promise<AzureUser> {
        try {
            return await this.client.api(`/users/${objectId}`).delete()
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
