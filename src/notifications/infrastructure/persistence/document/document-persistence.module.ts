import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  notificationSchema,
  Notifications,
} from './entities/Notification.schema';
import { NotificationRepository } from '../Notification.repository';
import { NotificationDocumentRepository } from './repositories/Notification.repository';

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
