import {
  // common
  Module,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { DocumentChannelPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [DocumentChannelPersistenceModule],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService, DocumentChannelPersistenceModule],
})
export class ChannelsModule {}
