import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../../../devices/infrastructure/persistence/relational/entities/device.entity';
import { DeviceSeedService } from './device-seed.service';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';
import { TemplateSchema } from '../../../templates/infrastructure/persistence/document/entities/template.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Templates } from '../../../templates/infrastructure/persistence/document/entities/template.schema';
import { ChannelsModule } from '../../../channels/channels.module';
import { TemplatesModule } from '../../../templates/templates.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeviceEntity, UserEntity]),
    MongooseModule.forFeature([
      {
        name: Templates.name,
        schema: TemplateSchema,
      },
    ]),
    ChannelsModule,
    TemplatesModule,
  ],
  providers: [DeviceSeedService],
  exports: [DeviceSeedService],
})
export class DeviceSeedModule {}
