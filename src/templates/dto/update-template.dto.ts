// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ChannelDefinitionDto } from './channel-definition.dto';
import { PrototypeDto } from './prototype.dto';

export class UpdateTemplateDto {
  @ApiProperty({
    type: String,
    description: 'Name of the template',
    minLength: 3,
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

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
    type: [ChannelDefinitionDto],
    description: 'List of channels defined in the template',
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => ChannelDefinitionDto)
  @IsOptional()
  channels?: ChannelDefinitionDto[];

  @ApiProperty({
    type: PrototypeDto,
    description: 'Desktop prototype configuration',
    required: false,
  })
  @ValidateNested()
  @Type(() => PrototypeDto)
  @IsOptional()
  desktopPrototype?: PrototypeDto;

  @ApiProperty({
    type: PrototypeDto,
    description: 'Mobile prototype configuration',
    required: false,
  })
  @ValidateNested()
  @Type(() => PrototypeDto)
  @IsOptional()
  mobilePrototype?: PrototypeDto;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the template is public',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  public?: boolean;
}
