import { BadRequestException } from '@nestjs/common'

export const INVALID_STATUS_ERROR = new BadRequestException(
    'Status ID is not from the same board',
)

export const STATUS_NOT_FOUND = new BadRequestException('Status ID not found')
