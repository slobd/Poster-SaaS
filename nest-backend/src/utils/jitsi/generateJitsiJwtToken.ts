import { User } from '@/iam/users/entities/user.entity'
import { sign as signToken, Algorithm } from 'jsonwebtoken'
import { readFile } from 'fs/promises'
import { getJitsiJwtPayload } from './getJitsiJwtPayload'
import { resolve } from 'path'

const jitsiPrivateKeyLocation = resolve('jitsi_key.pk')

const algorithm: Algorithm = 'RS256'

/**
 * Generate a jwt token for authenticating the user against jitsi.
 *
 * @see https://developer.8x8.com/jaas/docs/api-keys-jwt
 *
 */
export const generateJitsiJwtToken = async (
    user: User,
    isModerator: boolean,
): Promise<string> => {
    const payload = getJitsiJwtPayload(user, isModerator)
    console.log('payload', payload)
    const privateKey = await loadPrivateKey()

    return signToken(payload, privateKey, {
        algorithm,
        header: { alg: algorithm, kid: process.env.JITSI_API_KEY },
    })
}

export const loadPrivateKey = async (): Promise<string> => {
    try {
        const privateKey = await readFile(jitsiPrivateKeyLocation, {
            encoding: 'utf8',
        })
        return privateKey
    } catch (err) {
        err.message =
            `Failed to read jitsi private key file. Expected location: ${jitsiPrivateKeyLocation}\n
            File System Error:\n` + err.message
        throw err
    }
}
