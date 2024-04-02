import { Mail } from '../abstracts/mail.abstract'

export interface INewUpdatePasswordContext {
    userFirstName: string
    actionUrl: string
}

export class UpdatePasswordMail extends Mail {
    _subject = 'Your password has been changed'

    _from = 'no-reply@posterlab.co'

    _template = 'password-update'

    _context: INewUpdatePasswordContext

    constructor(context: INewUpdatePasswordContext) {
        super(context)
    }
}
