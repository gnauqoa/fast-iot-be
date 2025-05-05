import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelSchema, Channels } from './entities/channel.schema';
import { ChannelRepository } from '../channel.repository';
import { ChannelDocumentRepository } from './repositories/channel.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Channels.name, schema: ChannelSchema }]),
  ],
  providers: [
    {
      provide: ChannelRepository,
      useClass: ChannelDocumentRepository,
    },
  ],
  exports: [ChannelRepository, MongooseModule],
})
export class DocumentChannelPersistenceModule {}
