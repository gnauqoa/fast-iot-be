import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DeviceStatus, DeviceStatusStr } from './domain/device-status.enum';
import { DeviceRole } from './domain/device-role.enum';
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';
import { MqttService } from '../mqtt/mqtt.service';
import { SocketIoGateway } from '../socket-io/socket-io.gateway';
import { ChannelRepository } from '../channels/infrastructure/persistence/channel.repository';
import {
  UpdateDevicePinDto,
  UpdateDeviceSensorDto,
} from './dto/update-device.dto';
import { ScanDevicesDto } from './dto/scan-devices.dto';
import { createPaginatedResult } from '../utils/pagination';
import { createPointExpression } from '../utils/position';
import { METERS_PER_DEGREE } from '../../test/utils/constants';
import { TemplatesService } from '../templates/templates.service';

/**
 * Service for handling device operations including geographic scanning,
 * socket updates, and MQTT communication
 *
 * Extends TypeOrmCrudService to provide CRUD operations for DeviceEntity
 */
@Injectable()
export class DevicesService extends TypeOrmCrudService<DeviceEntity> {
  private readonly CACHE_KEY_PREFIX = 'device';
  private readonly CACHE_TTL = 3600; // Cache TTL in seconds (1 hour)

  constructor(
    @InjectRepository(DeviceEntity) repo: Repository<DeviceEntity>,
    @Inject(forwardRef(() => MqttService))
    private readonly mqttService: MqttService,
    @Inject(forwardRef(() => SocketIoGateway))
    private readonly socketIoGateway: SocketIoGateway,
    private readonly channelRepository: ChannelRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly templateService: TemplatesService,
  ) {
    super(repo);
  }

  async findById(id: number): Promise<DeviceEntity | null> {
    const device = await this.getDeviceDataFromCache(id);
    if (!device) {
      return null;
    }
    const template = await this.templateService.findById(device.templateId);

    return Object.assign(new DeviceEntity(), {
      ...device,
      template,
    });
  }

  /**
   * Get device data from cache or database
   * @param id - Device ID
   * @returns Device entity with channels
   */
  private async getDeviceDataFromCache(
    id: number,
  ): Promise<DeviceEntity | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;
    let deviceData: DeviceEntity | null = await this.cacheManager.get(cacheKey);

    if (!deviceData) {
      deviceData = await this.repo.findOne({
        where: { id },
        join: {
          alias: 'device',
          leftJoinAndSelect: {
            user: 'device.user',
          },
        },
      });

      if (deviceData) {
        deviceData.channels =
          (await this.channelRepository.getDeviceChannels(id)) || [];
        await this.cacheManager.set(cacheKey, deviceData, this.CACHE_TTL);
      }
    }

    return deviceData;
  }

  /**
   * Update device data in cache
   * @param id - Device ID
   * @param deviceData - Updated device data
   */
  private async updateDeviceCache(
    id: number,
    deviceData: Partial<DeviceEntity>,
  ): Promise<DeviceEntity> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;
    const existingData = await this.getDeviceDataFromCache(id);

    const updatedData = {
      ...existingData,
      channels: Array.from(
        new Map(
          [
            ...(existingData?.channels || []),
            ...(deviceData.channels || []),
          ].map((c) => [c.name, c]),
        ).values(),
      ),
    };
    await this.cacheManager.set(cacheKey, updatedData, this.CACHE_TTL);
    return updatedData as DeviceEntity;
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
        status: status
          ? DeviceStatus[status.toUpperCase()]
          : DeviceStatus.OFFLINE,
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
   * Update device channels via socket connection
   * @param id - Device ID
   * @param payload - Channel update information
   * @returns Updated device channel information
   */
  async socketUpdate(id: number, payload: UpdateDevicePinDto) {
    if (!payload.channels?.length) {
      throw new BadRequestException('Channels array is required for update');
    }

    // Get current device data
    const deviceData = await this.getDeviceDataFromCache(id);

    if (!deviceData) {
      throw new BadRequestException('Device not found');
    }

    const updatedChannels =
      await this.channelRepository.bulkUpdateDeviceChannels(
        id,
        deviceData.templateId,
        payload.channels,
      );

    const updatedDevice = await this.updateDeviceCache(id, {
      channels: updatedChannels,
    });

    const notifyData = {
      id,
      channels: updatedDevice?.channels,
      status: deviceData.status,
      lastUpdate: deviceData.lastUpdate,
      userId: deviceData.userId,
      position: deviceData.position,
    };
    this.notifyClients(id, notifyData);
    this.mqttService.publicMessage(
      `device/${id}`,
      updatedChannels.map((ch) => ({
        name: ch.name,
        value: ch.value,
      })),
    );

    return payload.channels;
  }

  /**
   * Update device status and information via MQTT
   * @param id - Device ID
   * @param deviceData - Updated device information
   * @returns Updated device entity with channels
   */
  async mqttUpdate(id: number, deviceData: UpdateDeviceSensorDto) {
    await this.updateDeviceStatusAndPosition(id, deviceData);

    // Get updated device data
    const updatedDevice = await this.getDeviceDataFromCache(id);

    if (!updatedDevice) {
      throw new NotFoundException('Device not found');
    }

    const status = deviceData.status
      ? DeviceStatusStr[deviceData.status]
      : DeviceStatusStr.ONLINE;

    let finalDeviceData = {
      ...updatedDevice,
      status,
    };
    let updatedChannels = updatedDevice.channels || [];

    // Handle multiple channel updates
    if (deviceData.channels?.length) {
      updatedChannels = await this.channelRepository.bulkUpdateDeviceChannels(
        id,
        updatedDevice.templateId,
        deviceData.channels,
      );

      finalDeviceData = Object.assign(new DeviceEntity(), {
        ...updatedDevice,
        status,
        channels: updatedChannels,
      });

      await this.updateDeviceCache(id, finalDeviceData);
    }

    const updatedDeviceData = await this.updateDeviceCache(id, finalDeviceData);

    const notifyData = {
      id: finalDeviceData.id,
      channels: updatedDeviceData.channels,
      status: finalDeviceData.status,
      lastUpdate: finalDeviceData.lastUpdate,
      userId: finalDeviceData.userId,
      position: finalDeviceData.position,
    };

    this.notifyClients(id, notifyData);

    return finalDeviceData;
  }

  /**
   * Update device status and position
   * @private
   */
  private async updateDeviceStatusAndPosition(
    id: number,
    deviceData: UpdateDeviceSensorDto,
  ): Promise<void> {
    const updateData: Partial<DeviceEntity> = {
      status: deviceData.status
        ? DeviceStatusStr[deviceData.status]
        : DeviceStatusStr.ONLINE,
      lastUpdate: new Date(),
    };

    const updateQuery = this.repo
      .createQueryBuilder()
      .update(DeviceEntity)
      .where('id = :id', { id });

    if (deviceData.latitude && deviceData.longitude) {
      const longitude = parseFloat(deviceData.longitude);
      const latitude = parseFloat(deviceData.latitude);
      updateQuery.set({
        status: updateData.status,
        lastUpdate: updateData.lastUpdate,
        position: () => createPointExpression(longitude, latitude),
      });
    } else {
      updateQuery.set({
        status: updateData.status,
        lastUpdate: updateData.lastUpdate,
      });
    }

    await updateQuery.execute();
  }
}
