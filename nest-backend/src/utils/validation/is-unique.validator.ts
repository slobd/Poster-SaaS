import { ValidatorConstraint } from 'class-validator'
import { Injectable } from '@nestjs/common'
import { UniqueValidator } from '@/utils/validation/abstract-is-unique.validator'
import { PrismaService } from '@/prisma/prisma.service'

@ValidatorConstraint({ name: 'unique', async: true })
@Injectable()
export class IsUnique extends UniqueValidator {
    constructor(protected readonly prisma: PrismaService) {
        super(prisma)
    }
}
