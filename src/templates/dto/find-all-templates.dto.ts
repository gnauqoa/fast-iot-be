import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class FindAllTemplatesDto {
  @ApiProperty({
    type: Number,
    description: 'Page number for pagination',
    required: false,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    type: Number,
    description: 'Number of items per page',
    required: false,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    type: String,
    description: 'Search term for template name or description',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    type: Boolean,
    description: 'Filter by public status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  public?: boolean;

  @ApiProperty({
    type: Number,
    description: 'Filter by user ID',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  userId?: number;
}
