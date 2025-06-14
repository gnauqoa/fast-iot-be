// users/dto/update-user-position.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateUserPositionDto {
  @ApiProperty({ example: 106.660172, description: 'Longitude' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 10.762622, description: 'Latitude' })
  @IsNumber()
  latitude: number;
}
