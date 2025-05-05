import { IsNumber } from 'class-validator';

export class CreateChannelDto {
  // Don't forget to use the class-validator decorators in the DTO properties.
  @IsNumber()
  deviceId: number;
}
