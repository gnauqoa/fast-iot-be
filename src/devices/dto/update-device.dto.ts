import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { ChannelValueType } from '../../channels/infrastructure/persistence/document/entities/channel.schema';
import { Type } from 'class-transformer';
import { DeviceStatusStr } from '../domain/device-status.enum';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}

export class ChannelUpdateDto {
  @IsString()
  name: string;

  value: ChannelValueType;
}

export class UpdateDevicePinDto {
  id: number;

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

  @IsString()
  @IsOptional()
  status?: DeviceStatusStr;
}
