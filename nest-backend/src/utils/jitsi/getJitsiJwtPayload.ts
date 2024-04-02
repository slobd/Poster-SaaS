import { User } from '@/iam/users/entities/user.entity'
import { getEnvValue } from '../helpers'
import { JitsiTokenPayload } from '@/live-session/live-session.types'

export const getJitsiJwtPayload = (
    user: User,
    isModerator: boolean,
): JitsiTokenPayload => {
    const nowInSeconds = Math.round(Date.now() / 1000)
    const oneMinuteAgo = nowInSeconds - 60
    const fiveHoursFromNow = nowInSeconds + 60 * 60 * 5

    return {
        aud: 'jitsi',
        exp: fiveHoursFromNow,
        nbf: oneMinuteAgo,
        iss: 'chat',
        room: '*',
        sub: getEnvValue('JITSI_APP_ID'),
        context: {
            features: {
                livestreaming: true,
                'outbound-call': true,
                'sip-outbound-call': false,
                transcription: true,
                recording: true,
            },
            user: {
                moderator: isModerator,
                name: user.firstName + ' ' + user.lastName,
                id: user.id,
                avatar: user.avatar?.location ?? '',
                email: user.email,
            },
        },
    }
}
