import {
    ValidationArguments,
    ValidatorConstraintInterface,
} from 'class-validator'
import { PrismaService } from '@/prisma/prisma.service'

type PrismaModels = 'tenant'

interface UniqueValidationArguments<E extends PrismaModels>
    extends ValidationArguments {
    constraints: [PrismaModels, string]
}

export abstract class UniqueValidator implements ValidatorConstraintInterface {
    protected constructor(protected readonly prisma: PrismaService) {}

    public async validate<E extends PrismaModels>(
        value: string,
        args: UniqueValidationArguments<E>,
    ): Promise<boolean> {
        const [modelName, findCondition = args.property] = args.constraints
        const count = await this.prisma[modelName].count({
            where: {
                [findCondition || args.property]: value,
            },
        })
        return count <= 0
    }

    public defaultMessage(args: ValidationArguments): string {
        const [EntityClass] = args.constraints
        const entity = EntityClass.name || 'Entity'
        return `${entity} with the same '${args.property}' already exist`
    }
}
