import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  IChannelDefinition,
  IPrototype,
  PrototypeDefinition,
} from '../domain/template';

export class CreateTemplateDto {
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
  @IsOptional()
  public?: boolean;
}
