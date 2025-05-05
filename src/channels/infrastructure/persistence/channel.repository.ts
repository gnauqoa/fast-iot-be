import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { channel } from '../../domain/channel';

export abstract class ChannelRepository {
  abstract getDeviceChannel(
    deviceId: number,
  ): Promise<NullableType<Record<string, any>>>;
  abstract updateDeviceChannel(
    deviceId: number,
    payload: DeepPartial<channel>,
  ): Promise<NullableType<Record<string, any>>>;
  abstract create(
    data: Omit<channel, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<channel>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<channel[]>;

  abstract findById(id: channel['id']): Promise<NullableType<channel>>;

  abstract findByIds(ids: channel['id'][]): Promise<channel[]>;

  abstract update(
    id: channel['id'],
    payload: DeepPartial<channel>,
  ): Promise<channel | null>;

  abstract remove(id: channel['id']): Promise<void>;
}
