import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Channel } from '../../domain/channel';

export abstract class ChannelRepository {
  abstract getDeviceChannel(deviceId: number): Promise<NullableType<Channel>>;
  abstract updateDeviceChannel(
    deviceId: number,
    payload: DeepPartial<Channel>,
  ): Promise<NullableType<Channel>>;
  abstract create(
    data: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>,
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
