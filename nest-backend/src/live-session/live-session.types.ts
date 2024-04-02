export interface SuccessResultWith<DataType> {
    status: 'success'
    data: DataType
}

export interface JitsiTokenPayload {
    aud: 'jitsi'
    exp: number
    nbf: number
    iss: 'chat'
    room: '*'
    sub: string
    context: {
        features: {
            livestreaming: boolean
            'outbound-call': boolean
            'sip-outbound-call': boolean
            transcription: true
            recording: true
        }
        user: JitsiUser
    }
}

export interface JitsiUser {
    moderator: boolean
    name: string
    id: number
    avatar: string
    email: string
}
