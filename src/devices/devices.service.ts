import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { info } from 'ps-logger';

// Domain imports
import { DeviceStatus, DeviceStatusStr } from './domain/device-status.enum';
import { DeviceRole } from './domain/device-role.enum';

// Entity imports
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';

// Service imports
import { MqttService } from '../mqtt/mqtt.service';
import { SocketIoGateway } from '../socket-io/socket-io.gateway';
import { ChannelRepository } from '../channels/infrastructure/persistence/channel.repository';

// DTO imports
import {
  UpdateDevicePinDto,
  UpdateDeviceSensorDto,
} from './dto/update-device.dto';
import { ScanDevicesDto } from './dto/scan-devices.dto';
import { createPaginatedResult } from '../utils/pagination';
import { createPointExpression } from '../utils/position';
import { METERS_PER_DEGREE } from '../../test/utils/constants';

/**
 * Service for handling device operations including geographic scanning,
 * socket updates, and MQTT communication
 *
 * Extends TypeOrmCrudService to provide CRUD operations for DeviceEntity
 */
@Injectable()
export class DevicesService extends TypeOrmCrudService<DeviceEntity> {
  constructor(
    @InjectRepository(DeviceEntity) repo: Repository<DeviceEntity>,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
    @Inject(forwardRef(() => SocketIoGateway))
    private readonly socketIoGateway: SocketIoGateway,
    private readonly channelRepository: ChannelRepository,
  ) {
    super(repo);
  }

  /**
   * Scan for nearby devices based on geographical location and filters
   * @param params - ScanDevicesDto containing location, radius and filter options
   * @returns Paginated list of devices within the specified radius
   */
  async scanNearbyDevices({
    latitude,
    longitude,
    radius,
    page = 1,
    limit = 10,
    status,
  }: ScanDevicesDto) {
    // Convert radius from meters to degrees (approximate at the equator)
    const radiusInDegrees = radius / METERS_PER_DEGREE;
    const point = createPointExpression(longitude, latitude);

    // Build the base query that will be reused
    const baseQuery = this.repo
      .createQueryBuilder('device')
      .where(`ST_DWithin(device.position, ${point}, :radius)`, {
        radius: radiusInDegrees,
      })
      .andWhere('role = :role', { role: DeviceRole.DEVICE })
      .andWhere('device.status = :status', {
        status: status ? DeviceStatus[status] : DeviceStatus.OFFLINE,
      });

    // Get total count
    const total = await baseQuery.clone().getCount();

    // Get paginated results with relations
    const devices = await baseQuery
      .leftJoinAndSelect('device.user', 'user')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // Return paginated results
    return createPaginatedResult(devices, total, page, limit);
  }

  /**
   * Find a device by ID with user relation
   * @param id - Device ID
   * @returns Device entity with relations or throws NotFoundException
   */
  private async findDeviceWithUser(id: number): Promise<DeviceEntity> {
    const device = await this.repo.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    return device;
  }

  /**
   * Notifies clients about device updates via WebSocket
   * @param deviceId - ID of the device
   * @param deviceData - Device data to send
   */
  private notifyClients(deviceId: number, deviceData: any): void {
    this.socketIoGateway.emitToRoom(
      `device/${deviceId}`,
      'device_data',
      deviceData,
    );
  }

  /**
   * Update device channels via socket connection
   * @param id - Device ID
   * @param payload - Channel update information
   * @returns Updated device with channel information
   */
  async socketUpdate(id: number, payload: UpdateDevicePinDto) {
    const device = await this.findDeviceWithUser(id);

    // Transform channel data and update in MongoDB
    const channelData = payload.channel;
    const channel = await this.channelRepository.updateDeviceChannel(
      device.id,
      channelData,
    );

    // Combine device with channel data
    const updatedDevice = {
      ...device,
      channel,
    };

    // Notify via MQTT and WebSockets
    this.mqttService.publicMessage(`device/${id}`, channel);
    this.notifyClients(id, updatedDevice);

    return updatedDevice;
  }

  /**
   * Update device status and information via MQTT
   * @param id - Device ID
   * @param deviceData - Updated device information
   * @returns Updated device entity with channel
   */
  async mqttUpdate(id: number, deviceData: UpdateDeviceSensorDto) {
    const queryRunner = this.repo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create base update query
      const baseQuery = queryRunner.manager
        .createQueryBuilder()
        .update(DeviceEntity)
        .where('id = :id', { id });

      // Prepare update data
      const updateData: Partial<DeviceEntity> = {
        status: DeviceStatusStr.ONLINE,
        lastUpdate: new Date(),
      };

      // Add position update if coordinates are provided
      if (deviceData.latitude && deviceData.longitude) {
        const longitude = parseFloat(deviceData.longitude);
        const latitude = parseFloat(deviceData.latitude);

        baseQuery.set({
          ...updateData,
          position: () => createPointExpression(longitude, latitude),
        });
      } else {
        baseQuery.set(updateData);
      }

      // Execute update
      await baseQuery.execute();

      // Retrieve updated device with relations
      const updatedDevice = await queryRunner.manager.findOne(DeviceEntity, {
        where: { id },
        join: {
          alias: 'device',
          leftJoinAndSelect: {
            user: 'device.user',
          },
        },
      });

      // Update channel if provided
      const channelData = deviceData.channel;
      const channel = await this.channelRepository.updateDeviceChannel(
        id,
        channelData,
      );

      await queryRunner.commitTransaction();

      info(`Device updated: ${JSON.stringify(updatedDevice)}`);

      // Combine device with channel and notify clients
      const deviceWithChannels = {
        ...updatedDevice,
        channel,
      };

      this.notifyClients(id, deviceWithChannels);

      return deviceWithChannels;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
