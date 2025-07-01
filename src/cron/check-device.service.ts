import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThan } from 'typeorm';
import { DeviceEntity } from '../devices/infrastructure/persistence/relational/entities/device.entity';
import dayjs from 'dayjs';
import { info } from 'console';
import { DeviceStatusStr } from '../devices/domain/device-status.enum';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class CheckDeviceService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    private readonly deviceService: DevicesService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleEvery5Minutes() {
    info('Check device task');

    const fiveMinutesAgo = dayjs().subtract(5, 'minutes').toDate();

    const offlineDevices = await this.deviceRepository.find({
      where: {
        lastUpdate: LessThan(fiveMinutesAgo),
        status: DeviceStatusStr.ONLINE,
      },
      join: { alias: 'device', leftJoinAndSelect: { user: 'device.user' } },
    });

    if (offlineDevices.length > 0) {
      await this.deviceRepository.update(
        { id: In(offlineDevices.map((device) => device.id)) },
        { status: DeviceStatusStr.OFFLINE },
      );

      for (const device of offlineDevices) {
        await this.deviceService.mqttUpdate(device.id, {
          id: device.id,
          status: DeviceStatusStr.OFFLINE,
        });
      }
    }
  }
}
