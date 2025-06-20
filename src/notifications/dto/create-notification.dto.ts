import { IsString, IsNotEmpty, IsInt, IsObject } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsObject()
  @IsNotEmpty()
  data: object;

  @IsInt()
  @IsNotEmpty()
  userId: number;
}
