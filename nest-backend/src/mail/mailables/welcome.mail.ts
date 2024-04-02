import { Mail } from '../abstracts/mail.abstract'

export interface IWelcomeMailContext {
    name: string
    actionUrl: string
    supportEmail: string
}

export class WelcomeMail extends Mail {
    _subject = 'Welcome to PosterLab'

    _from = 'hello@posterlab.co'

    _template = 'welcome'

    _context: IWelcomeMailContext

    constructor(context: IWelcomeMailContext) {
        super(context)
    }
}
