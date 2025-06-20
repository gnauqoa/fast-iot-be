import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  notificationSchema,
  Notifications,
} from './entities/notification.schema';
import { NotificationRepository } from '../notification.repository';
import { NotificationDocumentRepository } from './repositories/notification.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notifications.name, schema: notificationSchema },
    ]),
  ],
  providers: [
    {
      provide: NotificationRepository,
      useClass: NotificationDocumentRepository,
    },
  ],
  exports: [NotificationRepository],
})
export class DocumentnotificationPersistenceModule {}
