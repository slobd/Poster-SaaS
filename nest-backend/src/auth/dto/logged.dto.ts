import { Allow } from 'class-validator'

export class LoggedDto {
    @Allow()
    access_token: string
}
