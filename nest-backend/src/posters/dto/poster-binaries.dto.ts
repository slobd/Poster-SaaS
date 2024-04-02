import { ApiProperty } from '@nestjs/swagger'

export class PosterBinariesDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: '.jpeg file',
    })
    image: any

    @ApiProperty({ type: 'string', format: 'binary', description: '.pdf file' })
    pdf: any
}
