import { PartialType, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  firebaseToken?: string | null;
}

export class UpdateUserPasswordDto {
  @ApiProperty({ type: String })
  @IsOptional()
  password: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  previousPassword?: string;
}
