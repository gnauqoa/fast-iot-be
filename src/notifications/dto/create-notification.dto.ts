import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  data: string;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
