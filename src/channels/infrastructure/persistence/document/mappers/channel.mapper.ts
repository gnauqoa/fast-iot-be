import { Channel } from '../../../../domain/channel';
import { Channels } from '../entities/channel.schema';

export class ChannelMapper {
  public static toDomain(raw: Channels): Channel {
    const domainEntity = new Channel();
    domainEntity.id = raw._id.toString();
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deviceId = raw.deviceId;

    Object.keys(raw['_doc']).forEach((key) => {
      if (
        key !== '_id' &&
        key !== 'createdAt' &&
        key !== 'updatedAt' &&
        key !== 'deviceId' &&
        key !== '__v' &&
        key !== '$__' &&
        key !== '$isNew' &&
        key !== '_doc'
      ) {
        domainEntity[key] = raw['_doc'][key];
      }
    });

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

    Object.keys(domainEntity).forEach((key) => {
      if (
        key !== 'id' &&
        key !== 'createdAt' &&
        key !== 'updatedAt' &&
        key !== 'deviceId'
      ) {
        persistenceSchema[key] = domainEntity[key];
      }
    });

    return persistenceSchema;
  }
}
