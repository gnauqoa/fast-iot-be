import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ChannelValueType } from '../../channels/infrastructure/persistence/document/entities/channel.schema';
import { Type } from 'class-transformer';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}

export class ChannelUpdateDto {
  @IsString()
  channelName: string;

  channelValue: ChannelValueType;
}

export class UpdateDevicePinDto {
  id: number;

  @IsString()
  @IsOptional()
  channelName?: string;

  @IsOptional()
  channelValue?: ChannelValueType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChannelUpdateDto)
  @IsOptional()
  channels?: ChannelUpdateDto[];
}

export class UpdateDeviceSensorDto extends UpdateDevicePinDto {
  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;
}
