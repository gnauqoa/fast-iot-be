import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class BulkMarkAsReadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];
}
