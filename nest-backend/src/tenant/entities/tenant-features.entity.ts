import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { Tenant } from './tenant.entity'
import { IsBoolean, IsOptional } from 'class-validator'

@Entity({ name: 'TenantFeatures' })
export class TenantFeatures {
    @PrimaryGeneratedColumn()
    id?: number

    @IsBoolean()
    @IsOptional()
    @Column({ default: false })
    AccessControl: boolean

    @IsBoolean()
    @IsOptional()
    @Column({ default: false })
    TenantManagement: boolean

    @IsBoolean()
    @IsOptional()
    @Column({ default: false })
    Workspace: boolean

    @IsBoolean()
    @IsOptional()
    @Column({ default: false })
    Project: boolean

    @IsBoolean()
    @IsOptional()
    @Column({ default: false })
    Gallery: boolean

    @IsBoolean()
    @IsOptional()
    @Column({ default: false })
    People: boolean

    @IsBoolean()
    @IsOptional()
    @Column({ default: false })
    Comment: boolean

    @OneToOne(() => Tenant, (tenant) => tenant.features, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    tenant?: Tenant
}

export type FeaturesArray = (keyof Omit<TenantFeatures, 'id' | 'tenant'>)[]
