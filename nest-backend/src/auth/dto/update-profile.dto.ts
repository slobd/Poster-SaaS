import { UpdateProfileBinariesDto } from './updata-profile-binaries.dto'
import { ApiProperty } from '@nestjs/swagger'
import {
    IsBoolean,
    IsString,
    IsOptional,
    MaxLength,
    IsArray,
} from 'class-validator'

import { ValidateNested } from 'class-validator'
import { plainToClass, Transform, Type } from 'class-transformer'
import { Upload } from '@/uploads/upload.entity'
import { SkillDto } from './skill.dto'

export class UpdateProfileData {
    @IsOptional()
    @IsString()
    firstName?: string

    @IsOptional()
    @IsString()
    lastName?: string

    @IsOptional()
    @IsBoolean()
    disableNotifications?: boolean

    @IsOptional()
    @IsString()
    linkedin?: string

    @IsOptional()
    @IsString()
    researchGate?: string

    @IsOptional()
    @IsString()
    twitter?: string

    @ValidateNested()
    @Type(() => SkillDto)
    @IsArray()
    @IsOptional()
    skills?: SkillDto[]

    @IsOptional()
    avatar?: Upload

    @IsOptional()
    @IsString()
    @MaxLength(200)
    currentPosition?: string

    @IsOptional()
    @IsString()
    @MaxLength(600)
    biography?: string

    @IsOptional()
    @IsString()
    @MaxLength(300)
    organizationName?: string
}

export class UpdateProfileDto extends UpdateProfileBinariesDto {
    @ApiProperty({ description: 'Schema: UpdateProfileData' })
    @ValidateNested()
    @Transform(({ value }) =>
        plainToClass(UpdateProfileData, JSON.parse(value)),
    )
    data: UpdateProfileData
}
