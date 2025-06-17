import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Channel } from '../../domain/channel';
import { ChannelValueType } from './document/entities/channel.schema';

export abstract class ChannelRepository {
  abstract getDeviceChannels(deviceId: number): Promise<Channel[]>;
  abstract bulkUpdateDeviceChannels(
    deviceId: number,
    templateId: string,
    channels: { name: string; value: ChannelValueType }[],
  ): Promise<Channel[]>;
  abstract updateDeviceChannel(
    deviceId: number,
    templateId: string,
    name: string,
    value: ChannelValueType,
  ): Promise<Channel>;
  abstract create(
    data: Omit<Channel, 'id' | 'createdAt' | 'updatedAt' | 'name' | 'value'>,
  ): Promise<Channel>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Channel[]>;

  abstract findById(id: Channel['id']): Promise<NullableType<Channel>>;

  abstract findByIds(ids: Channel['id'][]): Promise<Channel[]>;

  abstract update(
    id: Channel['id'],
    payload: DeepPartial<Channel>,
  ): Promise<Channel | null>;

  abstract remove(id: Channel['id']): Promise<void>;
}
