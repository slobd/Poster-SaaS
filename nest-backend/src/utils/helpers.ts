import * as bcrypt from 'bcrypt'
import { Keyword, Prisma, User } from '@prisma/client'
import {
    SanitizedUserDto,
    SanitizedUserDtoClass,
} from '@/iam/users/dto/sanitized-user.dto'
import { classToPlain, plainToClass } from 'class-transformer'
import { AzureUser } from '@/azure/azure-user.service'

export function toSnakeCase(str: string): string {
    return str
        .replace(/\d+/g, ' ')
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join('_')
}

export function removeSchemeFromURL(url: string): string {
    return url.includes('https://')
        ? url.replace('https://', '')
        : url.includes('http://')
        ? url.replace('http://', '')
        : url
}

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}

export function getEnvValue(key: string): string {
    if (process.env[key] === undefined) {
        throw Error(`Tried to read process.env.${key}, but it wasn't set.`)
    }
    return process.env[key]
}

export function sanitizeUser(user: User): SanitizedUserDto {
    return plainToClass(SanitizedUserDtoClass, classToPlain(user))
}

export type MappedAzureUser = Pick<
    User,
    | 'objectId'
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'privacyPolicy'
    | 'termOfUse'
>

export function mapAzureUserToServiceUser(
    azureUser: AzureUser,
): MappedAzureUser {
    let email = ''

    if (azureUser.mail) email = azureUser.mail
    else if (azureUser.otherMails && azureUser.otherMails.length > 0) {
        email = azureUser.otherMails[0]
    } else {
        for (const identity of azureUser.identities) {
            if (identity.signInType === 'emailAddress')
                email = identity.issuerAssignedId
        }
    }

    return {
        objectId: azureUser.id,
        firstName: azureUser.givenName,
        lastName: azureUser.surname,
        email: email,
        privacyPolicy: true,
        termOfUse: true,
    }
}

export function createEvent<
    E extends new (...args: any[]) => any,
    A extends ConstructorParameters<E>[0],
>(event: E, args: A): InstanceType<E> {
    return new event(args)
}

export function keywordOrTopicToCreateOrConnect(
    arr: Pick<Keyword, 'name'>[],
    workspaceId: number,
): Prisma.KeywordCreateOrConnectWithoutPostersInput[] {
    return arr.map((a) => ({
        where: {
            name_workspaceId: {
                name: a.name,
                workspaceId: workspaceId,
            },
        },
        create: {
            name: a.name,
            workspace: {
                connect: {
                    id: workspaceId,
                },
            },
        },
    }))
}
