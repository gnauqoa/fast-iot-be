import { Injectable } from '@nestjs/common';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Notifications } from '../entities/notification.schema';
import { NotificationRepository } from '../../notification.repository';
import { Notification } from '../../../../domain/notification';
import { notificationMapper } from '../mappers/notification.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class NotificationDocumentRepository implements NotificationRepository {
  constructor(
    @InjectModel(Notifications.name)
    private readonly notificationModel: Model<Notifications>,
  ) {}

  async create(data: Notification): Promise<Notification> {
    const persistenceModel = notificationMapper.toPersistence(data);
    const createdEntity = new this.notificationModel(persistenceModel);
    const entityObject = await createdEntity.save();
    return notificationMapper.toDomain(entityObject);
  }

  async findAllWithPagination({
    paginationOptions,
    userId,
  }: {
    paginationOptions: IPaginationOptions;
    userId: number;
  }): Promise<Notification[]> {
    const entityObjects = await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit);

    return entityObjects.map((entityObject) =>
      notificationMapper.toDomain(entityObject),
    );
  }

  async findById(id: Notification['id']): Promise<NullableType<Notification>> {
    const entityObject = await this.notificationModel.findById(id);
    return entityObject ? notificationMapper.toDomain(entityObject) : null;
  }

  async findByIds(ids: Notification['id'][]): Promise<Notification[]> {
    const entityObjects = await this.notificationModel.find({
      _id: { $in: ids },
    });
    return entityObjects.map((entityObject) =>
      notificationMapper.toDomain(entityObject),
    );
  }

  async bulkUpdate(
    filter: FilterQuery<Notification>,
    data: Partial<Notification>,
  ): Promise<Notification[]> {
    const clonedPayload = { ...data };
    delete clonedPayload.id;

    const updateData = notificationMapper.toPersistence({
      ...clonedPayload,
    } as Notification);

    await this.notificationModel.updateMany(filter, { $set: updateData });

    const updatedEntities = await this.notificationModel.find(filter);

    return updatedEntities.map((entityObject) =>
      notificationMapper.toDomain(entityObject),
    );
  }

  async update(
    id: Notification['id'],
    payload: Partial<Notification>,
  ): Promise<NullableType<Notification>> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const entity = await this.notificationModel.findOne(filter);

    if (!entity) {
      throw new Error('Record not found');
    }

    const entityObject = await this.notificationModel.findOneAndUpdate(
      filter,
      notificationMapper.toPersistence({
        ...notificationMapper.toDomain(entity),
        ...clonedPayload,
      }),
      { new: true },
    );

    return entityObject ? notificationMapper.toDomain(entityObject) : null;
  }

  async remove(id: Notification['id']): Promise<void> {
    await this.notificationModel.deleteOne({ _id: id });
  }

  async countUnread(userId: number): Promise<number> {
    return this.notificationModel.countDocuments({ userId, isRead: false });
  }
}
