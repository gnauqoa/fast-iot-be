import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({
    type: String,
    description: 'Device name',
    example: 'My Device',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Associated user ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    type: String,
    description: 'Template ID',
    example: '1',
  })
  @IsString()
  templateId: string;
}
