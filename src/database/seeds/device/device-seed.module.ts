import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceEntity } from '../../../devices/infrastructure/persistence/relational/entities/device.entity';
import { DeviceSeedService } from './device-seed.service';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';
import { TemplateSchema } from '../../../templates/infrastructure/persistence/document/entities/template.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Templates } from '../../../templates/infrastructure/persistence/document/entities/template.schema';
import { ChannelsModule } from '../../../channels/channels.module';
import { TemplateRepository } from '../../../templates/infrastructure/persistence/template.repository';
import { TemplateDocumentRepository } from '../../../templates/infrastructure/persistence/document/repositories/template.repository';

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
  ],
  providers: [
    DeviceSeedService,
    {
      provide: TemplateRepository,
      useClass: TemplateDocumentRepository,
    },
  ],
  exports: [DeviceSeedService],
})
export class DeviceSeedModule {}
