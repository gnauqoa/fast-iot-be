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
import { Edge, Node } from '@xyflow/react';
import { ChannelType } from './enums/channel-type.enum';

export interface IPrototype {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  nodes: Node[];
  edges: Edge[];
}

export interface IChannelDefinition {
  name: string;
  type: ChannelType;
}

export class ViewportDefinition {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty()
  @IsNumber()
  zoom: number;
}

export class PrototypeDefinition implements IPrototype {
  @ApiProperty({ type: ViewportDefinition })
  @ValidateNested()
  @Type(() => ViewportDefinition)
  viewport: ViewportDefinition;

  @ApiProperty({ type: [Object] })
  @IsNotEmpty()
  nodes: Node[];

  @ApiProperty({ type: [Object] })
  @IsNotEmpty()
  edges: Edge[];
}

export class Template {
  @ApiProperty({
    type: String,
    description: 'Unique identifier of the template',
  })
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
  deletedAt?: Date | null;
}
