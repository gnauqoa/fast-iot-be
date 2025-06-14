import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { notificationsController } from './notifications.controller';
import { DocumentnotificationPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [DocumentnotificationPersistenceModule, FirebaseModule, UsersModule],
  controllers: [notificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService, DocumentnotificationPersistenceModule],
})
export class NotificationsModule {}
