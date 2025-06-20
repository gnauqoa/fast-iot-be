import { FilterQuery } from 'mongoose';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Notification } from '../../domain/notification';

export abstract class NotificationRepository {
  abstract create(
    data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Notification>;

  abstract findAllWithPagination({
    paginationOptions,
    userId,
  }: {
    paginationOptions: IPaginationOptions;
    userId: number;
  }): Promise<Notification[]>;

  abstract findById(
    id: Notification['id'],
  ): Promise<NullableType<Notification>>;

  abstract findByIds(ids: Notification['id'][]): Promise<Notification[]>;

  abstract bulkUpdate(
    filter: FilterQuery<Notification>,
    data: Partial<Notification>,
  ): Promise<Notification[]>;

  abstract update(
    id: Notification['id'],
    payload: DeepPartial<Notification>,
  ): Promise<Notification | null>;

  abstract remove(id: Notification['id']): Promise<void>;

  abstract countUnread(userId: number): Promise<number>;
}
