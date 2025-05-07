import { Channel } from '../../../../domain/channel';
import { Channels } from '../entities/channel.schema';

export class ChannelMapper {
  public static toDomain(raw: Channels): Channel {
    const domainEntity = new Channel();
    domainEntity.id = raw._id.toString();
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deviceId = raw.deviceId;
    domainEntity.name = raw.name;
    domainEntity.value = raw.value;

    return domainEntity;
  }

  public static toPersistence(
    domainEntity: Channel & Record<string, any>,
  ): Channels {
    const persistenceSchema = new Channels();
    if (domainEntity.id) {
      persistenceSchema._id = domainEntity.id;
    }
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;
    persistenceSchema.deviceId = domainEntity.deviceId;
    persistenceSchema.name = domainEntity.name;
    persistenceSchema.value = domainEntity.value;

    return persistenceSchema;
  }
}
