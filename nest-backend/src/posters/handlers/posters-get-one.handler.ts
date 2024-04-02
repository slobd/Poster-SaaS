import { Injectable, NotFoundException, Scope } from '@nestjs/common'
import { PosterDto, PosterRepository } from '../poster.repository'

@Injectable({ scope: Scope.REQUEST })
export class PostersGetOneHandler {
    constructor(private readonly posterRepository: PosterRepository) {}

    async handle(id: number): Promise<PosterDto> {
        const poster = await this.posterRepository.findOneById(id)

        if (!poster) throw new NotFoundException()

        return poster
    }
}
