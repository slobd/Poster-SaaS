import { Mail } from '../abstracts/mail.abstract'

export interface IExistingUserWorkspaceWelcomeMailContext {
    email: string
    workspaceName: string
    actionUrl: string
}

export class ExistingUserWorkspaceWelcomeMail extends Mail {
    _subject = 'Added to Workspace'

    _template = 'existing-user-workspace-welcome'

    _from = 'hello@posterlab.co'

    _context: IExistingUserWorkspaceWelcomeMailContext

    constructor(context: IExistingUserWorkspaceWelcomeMailContext) {
        super(context)
    }
}
