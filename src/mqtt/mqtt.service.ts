import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';
import { error, info } from 'ps-logger';
import { DevicesService } from '../devices/devices.service';
import { UpdateDeviceSensorDto } from '../devices/dto/update-device.dto';

@Injectable()
export class MqttService implements OnModuleInit {
  private mqttClient: MqttClient;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => DevicesService))
    private deviceService: DevicesService,
  ) {}

  onModuleInit() {
    const clientId = `mqtt_${crypto.randomUUID()}`;
    const mqttUrl = this.configService.getOrThrow<string>('app.mqttUrl', {
      infer: true,
    });
    const mqttUser = this.configService.getOrThrow<string>('app.mqttUser', {
      infer: true,
    });
    const mqttPass = this.configService.getOrThrow<string>('app.mqttPass', {
      infer: true,
    });

    this.mqttClient = connect(mqttUrl, {
      username: mqttUser,
      password: mqttPass,
      clientId,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    this.mqttClient.on('connect', () => {
      info('MQTT - Connected');

      this.mqttClient.subscribe('device/+/update', (err) => {
        if (err) {
          error('MQTT - Error subscribing to device/+/update');
        } else {
          info('MQTT - Subscribed device/+/update');
        }
      });
    });

    this.mqttClient.on('message', async (topic, message) => {
      if (topic.includes('device') && topic.includes('update')) {
        await this.handleDeviceUpdate(JSON.parse(message.toString()));
      }
    });

    this.mqttClient.on('error', (err) => {
      error(`MQTT - Error in connecting to CloudMQTT: ${err}`);
    });
  }

  private async handleDeviceUpdate(data: UpdateDeviceSensorDto) {
    try {
      info(`MQTT - Device update sensor: ${JSON.stringify(data)}`);
      await this.deviceService.mqttUpdate(data.id, data);
    } catch (err) {
      error(`MQTT - Error in handleDeviceUpdate:
      ${err}`);
    }
  }

  public publicMessage(topic: string, message: any) {
    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }

    if (!this.mqttClient.connected) {
      error('MQTT - Client not connected');
      return;
    }

    this.mqttClient.publish(topic, message);
  }
}
