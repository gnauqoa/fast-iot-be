import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Channels,
  ChannelSchema,
} from '../../../../channels/infrastructure/persistence/document/entities/channel.schema';
import { ChannelSeedService } from './channel-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Channels.name,
        schema: ChannelSchema,
      },
    ]),
  ],
  providers: [ChannelSeedService],
  exports: [ChannelSeedService],
})
export class ChannelSeedModule {}
