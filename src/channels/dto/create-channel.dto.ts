import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  // Don't forget to use the class-validator decorators in the DTO properties.
  @IsNumber()
  deviceId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  value?: string | number | boolean | object;
}
