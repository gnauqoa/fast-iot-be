import { PartialType } from '@nestjs/swagger';
import { CreateDeviceDto } from './create-device.dto';
import {
  IsString,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validator to ensure `channels` does not contain forbidden keys
 */
@ValidatorConstraint({ name: 'NoForbiddenChannelKeys', async: false })
class NoForbiddenChannelKeysConstraint implements ValidatorConstraintInterface {
  validate(channels: any): boolean {
    if (typeof channels !== 'object' || channels === null) return false;
    const forbiddenKeys = ['id', 'deviceId', 'createdAt', 'updatedAt'];
    return !forbiddenKeys.some((key) =>
      Object.prototype.hasOwnProperty.call(channels, key),
    );
  }

  defaultMessage(): string {
    return 'Channels object must not contain keys: "id" or "deviceId"';
  }
}

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}

export class UpdateDevicePinDto {
  @Validate(NoForbiddenChannelKeysConstraint)
  channel: object;

  id: number;
}

export class UpdateDeviceSensorDto extends UpdateDevicePinDto {
  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;
}
