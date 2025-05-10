import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ViewportDto {
  @ApiProperty({
    type: Number,
    description: 'X coordinate of the viewport',
    default: 0,
  })
  @IsNumber()
  x: number;

  @ApiProperty({
    type: Number,
    description: 'Y coordinate of the viewport',
    default: 0,
  })
  @IsNumber()
  y: number;

  @ApiProperty({
    type: Number,
    description: 'Zoom level of the viewport',
    default: 1,
  })
  @IsNumber()
  zoom: number;
}
