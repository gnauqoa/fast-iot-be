import { Notification } from '../../../../domain/Notification';
import { Notifications } from '../entities/Notification.schema';

export class notificationMapper {
  public static toDomain(raw: Notifications): Notification {
    const domainEntity = new Notification();
    domainEntity.id = raw._id.toString();
    domainEntity.title = raw.title;
    domainEntity.body = raw.body;
    domainEntity.data = raw.data;
    domainEntity.userId = raw.userId;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.isRead = raw.isRead;
    return domainEntity;
  }

  public static toPersistence(domainEntity: Notification): Notifications {
    const persistenceSchema = new Notifications();
    if (domainEntity.id) {
      persistenceSchema._id = domainEntity.id;
    }
    persistenceSchema.title = domainEntity.title;
    persistenceSchema.body = domainEntity.body;
    persistenceSchema.data = domainEntity.data;
    persistenceSchema.userId = domainEntity.userId;
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.isRead = domainEntity.isRead;
    return persistenceSchema;
  }
}
