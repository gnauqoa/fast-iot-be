import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { info } from 'ps-logger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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
import { Channel } from '../channels/domain/channel';
import { ChannelValueType } from '../channels/infrastructure/persistence/document/entities/channel.schema';

/**
 * Service for handling device operations including geographic scanning,
 * socket updates, and MQTT communication
 *
 * Extends TypeOrmCrudService to provide CRUD operations for DeviceEntity
 */
@Injectable()
export class DevicesService extends TypeOrmCrudService<DeviceEntity> {
  private readonly CACHE_KEY_PREFIX = 'device';

  constructor(
    @InjectRepository(DeviceEntity) repo: Repository<DeviceEntity>,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
    @Inject(forwardRef(() => SocketIoGateway))
    private readonly socketIoGateway: SocketIoGateway,
    private readonly channelRepository: ChannelRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    // Build the query with all conditions
    const baseQuery = this.repo
      .createQueryBuilder('device')
      .where(`ST_DWithin(device.position, ${point}, :radius)`, {
        radius: radiusInDegrees,
      })
      .andWhere('role = :role', { role: DeviceRole.DEVICE })
      .andWhere('device.status = :status', {
        status: status ? DeviceStatus[status] : DeviceStatus.OFFLINE,
      });

    // Get total count and paginated results
    const [total, devices] = await Promise.all([
      baseQuery.clone().getCount(),
      baseQuery
        .leftJoinAndSelect('device.user', 'user')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),
    ]);

    return createPaginatedResult(devices, total, page, limit);
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
   * Gets device channels from cache or repository
   * @param id - Device ID
   * @returns Array of device channels
   */
  async getDeviceChannelsFromCache(id: number): Promise<Channel[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}:channels`;
    let channels: Channel[] | null = await this.cacheManager.get(cacheKey);

    if (!channels) {
      channels = (await this.channelRepository.getDeviceChannel(id)) || [];
      await this.cacheManager.set(cacheKey, channels);
    }

    return channels;
  }

  /**
   * Updates channel cache with new channel values
   * @param id - Device ID
   * @param channelName - Name of the channel to update
   * @param channelValue - New value for the channel
   * @returns Updated array of channels
   */
  private async updateChannelCache(
    id: number,
    channelName: string,
    channelValue: ChannelValueType,
  ): Promise<Channel[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}:channels`;
    const channels = await this.getDeviceChannelsFromCache(id);

    const updatedChannels = channels.map((c) =>
      c.name === channelName ? { ...c, value: channelValue } : c,
    );

    await this.cacheManager.set(cacheKey, updatedChannels);
    return updatedChannels;
  }

  /**
   * Update device channels via socket connection
   * @param id - Device ID
   * @param payload - Channel update information
   * @returns Updated device channel information
   */
  async socketUpdate(id: number, payload: UpdateDevicePinDto) {
    if (!payload.channelName || !payload.channelValue) {
      throw new BadRequestException(
        'Channel name and value are required for update',
      );
    }

    // Update channel in repository
    const channel = await this.channelRepository.updateDeviceChannel(
      id,
      payload.channelName,
      payload.channelValue,
    );

    // Update cache and return updated channels
    return this.updateChannelCache(id, channel.name, channel.value);
  }

  /**
   * Update device status and information via MQTT
   * @param id - Device ID
   * @param deviceData - Updated device information
   * @returns Updated device entity with channels
   */
  async mqttUpdate(id: number, deviceData: UpdateDeviceSensorDto) {
    const queryRunner = this.repo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Prepare update data
      const updateData: Partial<DeviceEntity> = {
        status: DeviceStatusStr.ONLINE,
        lastUpdate: new Date(),
      };

      // Create update query
      const updateQuery = queryRunner.manager
        .createQueryBuilder()
        .update(DeviceEntity)
        .where('id = :id', { id });

      // Add position update if coordinates are provided
      if (deviceData.latitude && deviceData.longitude) {
        const longitude = parseFloat(deviceData.longitude);
        const latitude = parseFloat(deviceData.latitude);
        updateQuery.set({
          ...updateData,
          position: () => createPointExpression(longitude, latitude),
        });
      } else {
        updateQuery.set(updateData);
      }

      // Execute update
      await updateQuery.execute();

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

      // Update channel if name and value are provided
      if (
        updatedDevice &&
        deviceData.channelName &&
        deviceData.channelValue !== undefined
      ) {
        await this.channelRepository.updateDeviceChannel(
          id,
          deviceData.channelName,
          deviceData.channelValue,
        );

        // Update cache and assign updated channels to device
        updatedDevice.channels = await this.updateChannelCache(
          id,
          deviceData.channelName,
          deviceData.channelValue,
        );
      }

      await queryRunner.commitTransaction();
      info(`Device updated: ${JSON.stringify(updatedDevice)}`);

      // Notify clients about the update
      this.notifyClients(id, updatedDevice);

      return updatedDevice;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
