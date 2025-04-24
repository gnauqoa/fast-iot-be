import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({
    description: 'The name of the template',
    example: 'My Template',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A description of the template',
    example: 'This is a sample template',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The ID of the user who owns the template',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: 'The prototype data for the template (JSON object)',
    example: { key: 'value' },
    required: false,
  })
  @IsOptional()
  prototype?: any; // Adjust type if a specific interface is defined

  @ApiProperty({
    description: 'Whether the template is public',
    example: false,
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  public?: boolean;
}
