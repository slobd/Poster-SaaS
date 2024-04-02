import { IsString, Length } from 'class-validator'

export class SendMessageDto {
    @IsString()
    @Length(1, 1000)
    message: string
}
