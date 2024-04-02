/* eslint-disable camelcase */
export {}

declare global {
    // This could be typed as JitsiMeetExternalAPIConstructor,
    //  but the @types/jitsi-meet definitions are a bit outdated.
    const JitsiMeetExternalAPI: any
    interface Window {
        analytics: string[] | Record<string, any>
        consentManagerConfig: (exports: any) => void
    }
}
