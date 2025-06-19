import {
  // do not remove this comment
  Module,
  forwardRef,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { notificationsController } from './notifications.controller';
import { DocumentnotificationPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersModule } from '../users/users.module';
import { SocketIoModule } from '../socket-io/socket-io.module';

@Module({
  imports: [
    DocumentnotificationPersistenceModule,
    FirebaseModule,
    UsersModule,
    forwardRef(() => SocketIoModule),
  ],
  controllers: [notificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService, DocumentnotificationPersistenceModule],
})
export class NotificationsModule {}
