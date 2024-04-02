import { DeepPartial, Repository } from 'typeorm'

export type InitCreateUtil<Entity> = (
    entityRepo: Repository<Entity>,
) => (entity?: DeepPartial<Entity>) => Promise<Entity>
