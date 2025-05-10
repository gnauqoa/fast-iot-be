import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  IChannelDefinition,
  IPrototype,
  PrototypeDefinition,
} from '../domain/template';

export class TemplateDto {
  @ApiProperty({
    type: String,
    description: 'Unique identifier of the template',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Name of the template',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Description of the template',
    minLength: 10,
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: Number,
    description: 'ID of the user who created the template',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiProperty({
    type: [Object],
    description: 'List of channels defined in the template',
  })
  @ValidateNested({ each: true })
  @Type(() => Object)
  channels: IChannelDefinition[];

  @ApiProperty({
    type: Object,
    description: 'Desktop prototype configuration',
    required: false,
  })
  @ValidateNested()
  @Type(() => PrototypeDefinition)
  @IsOptional()
  desktopPrototype?: IPrototype;

  @ApiProperty({
    type: Object,
    description: 'Mobile prototype configuration',
    required: false,
  })
  @ValidateNested()
  @Type(() => PrototypeDefinition)
  @IsOptional()
  mobilePrototype?: IPrototype;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the template is public',
    default: false,
  })
  @IsBoolean()
  public: boolean;

  @ApiProperty({
    type: Date,
    description: 'Creation timestamp',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Last update timestamp',
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Deletion timestamp',
    required: false,
  })
  @IsDate()
  @IsOptional()
  deletedAt?: Date;
}
