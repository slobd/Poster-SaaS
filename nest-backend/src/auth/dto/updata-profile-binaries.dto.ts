import { ApiProperty } from '@nestjs/swagger'

export class UpdateProfileBinariesDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: '.jpeg file',
    })
    avatar: any
}
