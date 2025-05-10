import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Edge, Node } from '@xyflow/react';
import { ViewportDto } from './viewport.dto';

export class PrototypeDto {
  @ApiProperty({
    type: ViewportDto,
    description: 'Viewport configuration',
  })
  @ValidateNested()
  @Type(() => ViewportDto)
  viewport: ViewportDto;

  @ApiProperty({
    type: [Object],
    description: 'List of nodes in the prototype',
    default: [],
  })
  @IsArray()
  @IsNotEmpty()
  nodes: Node[];

  @ApiProperty({
    type: [Object],
    description: 'List of edges in the prototype',
    default: [],
  })
  @IsArray()
  @IsNotEmpty()
  edges: Edge[];
}
