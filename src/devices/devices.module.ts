import { Module, forwardRef } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceEntity } from './infrastructure/persistence/relational/entities/device.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { SocketIoModule } from '../socket-io/socket-io.module';
import { ChannelsModule } from '../channels/channels.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity]),
    TemplatesModule,
    AuthModule,
    UsersModule,
    ChannelsModule,
    forwardRef(() => MqttModule),
    forwardRef(() => SocketIoModule),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService, TypeOrmModule],
})
export class DevicesModule {}
