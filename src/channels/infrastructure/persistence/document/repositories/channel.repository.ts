import { Injectable, NotFoundException } from '@nestjs/common';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channels } from '../entities/channel.schema';
import { ChannelRepository } from '../../channel.repository';
import { Channel } from '../../../../domain/channel';
import { ChannelMapper } from '../mappers/channel.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

@Injectable()
export class ChannelDocumentRepository implements ChannelRepository {
  constructor(
    @InjectModel(Channels.name)
    private readonly channelModel: Model<Channels>,
  ) {}

  async getDeviceChannel(deviceId: number): Promise<NullableType<Channel>> {
    const entityObject = await this.channelModel.findOne({ deviceId });
    return entityObject ? ChannelMapper.toDomain(entityObject) : null;
  }

  async updateDeviceChannel(
    deviceId: number,
    payload: Partial<Channel>,
  ): Promise<NullableType<Channel>> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { deviceId: deviceId };
    const entity = await this.channelModel.findOne(filter);

    if (!entity) {
      throw new NotFoundException('Record not found');
    }

    const entityObject = await this.channelModel.findOneAndUpdate(
      filter,
      ChannelMapper.toPersistence({
        ...ChannelMapper.toDomain(entity),
        ...clonedPayload,
      }),
      { new: true },
    );

    return entityObject ? ChannelMapper.toDomain(entityObject) : null;
  }

  async create(data: Channel): Promise<Channel> {
    const persistenceModel = ChannelMapper.toPersistence(data);
    const createdEntity = new this.channelModel(persistenceModel);
    const entityObject = await createdEntity.save();
    return ChannelMapper.toDomain(entityObject);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Channel[]> {
    const entityObjects = await this.channelModel
      .find()
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit);

    return entityObjects.map((entityObject) =>
      ChannelMapper.toDomain(entityObject),
    );
  }

  async findById(id: Channel['id']): Promise<NullableType<Channel>> {
    const entityObject = await this.channelModel.findById(id);
    return entityObject ? ChannelMapper.toDomain(entityObject) : null;
  }

  async findByIds(ids: Channel['id'][]): Promise<Channel[]> {
    const entityObjects = await this.channelModel.find({ _id: { $in: ids } });
    return entityObjects.map((entityObject) =>
      ChannelMapper.toDomain(entityObject),
    );
  }

  async update(
    id: Channel['id'],
    payload: Partial<Channel>,
  ): Promise<NullableType<Channel>> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const entity = await this.channelModel.findOne(filter);

    if (!entity) {
      throw new Error('Record not found');
    }

    const entityObject = await this.channelModel.findOneAndUpdate(
      filter,
      ChannelMapper.toPersistence({
        ...ChannelMapper.toDomain(entity),
        ...clonedPayload,
      }),
      { new: true },
    );

    return entityObject ? ChannelMapper.toDomain(entityObject) : null;
  }

  async remove(id: Channel['id']): Promise<void> {
    await this.channelModel.deleteOne({ _id: id });
  }
}
