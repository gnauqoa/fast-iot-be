import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';
import { IsString, IsOptional } from 'class-validator';
import { ChannelValueType } from '../../channels/infrastructure/persistence/document/entities/channel.schema';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}

export class UpdateDevicePinDto {
  id: number;

  @IsString()
  @IsOptional()
  channelName?: string;

  @IsOptional()
  channelValue?: ChannelValueType;
}

export class UpdateDeviceSensorDto extends UpdateDevicePinDto {
  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;
}
