import { channel } from '../../../../domain/channel';
import { Channels } from '../entities/channel.schema';

export class ChannelMapper {
  public static toDomain(raw: Channels): channel {
    const domainEntity = new channel();
    domainEntity.id = raw._id.toString();
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deviceId = raw.deviceId;

    return domainEntity;
  }

  public static toCleanDomain(
    raw: Channels & Record<string, any>,
  ): Record<string, any> {
    const data = {};

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
        data[key] = raw['_doc'][key];
      }
    });

    return data;
  }

  public static toPersistence(
    domainEntity: channel & Record<string, any>,
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
