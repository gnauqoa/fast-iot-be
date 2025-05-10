import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from '../../../devices/infrastructure/persistence/relational/entities/device.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { DeviceRole } from '../../../devices/domain/device-role.enum';
import * as crypto from 'crypto';
import { METERS_PER_DEGREE } from '../../../../test/utils/constants';
import { InjectModel } from '@nestjs/mongoose';
import { Templates } from '../../../templates/infrastructure/persistence/document/entities/template.schema';
import { ChannelsService } from '../../../channels/channels.service';
import { TemplateRepository } from '../../../templates/infrastructure/persistence/template.repository';

@Injectable()
export class DeviceSeedService {
  constructor(
    @InjectRepository(DeviceEntity)
    private repository: Repository<DeviceEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectModel(Templates.name)
    private readonly channelService: ChannelsService,
    private readonly templateRepository: TemplateRepository,
    private readonly configService: ConfigService,
  ) {}

  async run() {
    await this.repository.delete({});

    const areaCoordinates = {
      lat: 10.8080783,
      lng: 106.7043858,
      radius: 10000,
    };

    const adminMqttUser = await this.configService.getOrThrow('app.mqttUser', {
      infer: true,
    });
    const adminMqttPassword = await this.configService.getOrThrow(
      'app.mqttPass',
      { infer: true },
    );

    await this.repository
      .create({
        name: 'Admin',
        deviceKey: adminMqttUser,
        deviceToken: adminMqttPassword,
        role: DeviceRole.ADMIN,
      })
      .save();

    const users = await this.userRepository.find({});
    const userIds = users.map((user) => user.id);

    const templates = await this.templateRepository.find();

    const templateIds = templates.map((template) => template.id);

    const devices = Array.from({ length: 30 }, () => {
      return this.repository.create({
        name: faker.vehicle.vehicle(),
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        deviceKey: crypto.randomBytes(16).toString('hex'),
        deviceToken: crypto.randomBytes(16).toString('hex'),
        role: DeviceRole.DEVICE,
        templateId: templateIds[Math.floor(Math.random() * templateIds.length)],
      });
    });

    const savedDevices = await this.repository.save(devices);

    for (const device of savedDevices) {
      const lng =
        areaCoordinates.lng +
        ((Math.random() - 0.01) * areaCoordinates.radius) / METERS_PER_DEGREE;
      const lat =
        areaCoordinates.lat +
        ((Math.random() - 0.01) * areaCoordinates.radius) / METERS_PER_DEGREE;

      await this.repository
        .createQueryBuilder()
        .update(DeviceEntity)
        .set({
          position: () => `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`,
        })
        .where('id = :id', { id: device.id })
        .execute();
    }
  }
}
