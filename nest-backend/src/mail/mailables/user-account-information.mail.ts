import { Mail } from '../abstracts/mail.abstract'

export interface IUserAccountInformationMailContext {
    email: string
    workspaceName: string
    password: string
    actionUrl: string
}

export class UserAccountInformationMail extends Mail {
    _subject = 'User Account Information'

    _template = 'user-account-information'

    _from = 'hello@posterlab.co'

    _context: IUserAccountInformationMailContext

    constructor(context: IUserAccountInformationMailContext) {
        super(context)
    }
}
