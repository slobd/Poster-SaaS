import { PrismaService } from '@/prisma/prisma.service'
import { Prisma, Upload } from '@prisma/client'
import { Injectable, InternalServerErrorException } from '@nestjs/common'

@Injectable()
export class UploadRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.UploadCreateInput): Promise<Upload> {
        return this.prisma.upload.create({
            data,
        })
    }
    async update(id: number, data: Prisma.UploadUpdateInput): Promise<Upload> {
        return this.prisma.upload.update({
            where: { id },
            data,
        })
    }
    async delete(id: number): Promise<Upload> {
        try {
            return this.prisma.upload.delete({ where: { id } })
        } catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}
