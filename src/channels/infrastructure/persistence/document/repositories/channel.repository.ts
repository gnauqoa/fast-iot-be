import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Channels, ChannelValueType } from '../entities/channel.schema';
import { ChannelRepository } from '../../channel.repository';
import { Channel } from '../../../../domain/channel';
import { ChannelMapper } from '../mappers/channel.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { TemplatesService } from '../../../../../templates/templates.service';

@Injectable()
export class ChannelDocumentRepository implements ChannelRepository {
  constructor(
    @InjectModel(Channels.name)
    private readonly channelModel: Model<Channels>,
    private readonly templateService: TemplatesService,
  ) {}

  async getDeviceChannels(deviceId: number): Promise<Channel[]> {
    const entityObject = await this.channelModel.find({ deviceId });
    if (!entityObject) {
      return [];
    }
    return entityObject.map((entity) => ChannelMapper.toDomain(entity));
  }

  private async validateChannelValue(
    channels: { name: string; value: any }[],
    templateId: string,
  ) {
    const template = await this.templateService.findById(templateId);

    const templateChannelMapped = template.channels.reduce((acc, channel) => {
      acc[channel.name] = channel;
      return acc;
    }, {});

    for (const channel of channels) {
      if (!templateChannelMapped[channel.name]) {
        throw new BadRequestException(
          `Channel ${channel.name} not found in template`,
        );
      }

      if (templateChannelMapped[channel.name].type === 'select') {
        if (
          !templateChannelMapped[channel.name].options.find(
            (option) => option.value === channel.value,
          )
        ) {
          throw new BadRequestException(
            `Channel ${channel.name} value ${channel.value} not found in template`,
          );
        }
      }

      if (templateChannelMapped[channel.name].type === 'number') {
        if (typeof channel.value !== 'number') {
          throw new BadRequestException(
            `Channel ${channel.name} value ${channel.value} is not a number`,
          );
        }
      }

      if (templateChannelMapped[channel.name].type === 'string') {
        if (typeof channel.value !== 'string') {
          throw new BadRequestException(
            `Channel ${channel.name} value ${channel.value} is not a string`,
          );
        }
      }

      if (templateChannelMapped[channel.name].type === 'boolean') {
        if (typeof channel.value !== 'boolean') {
          throw new BadRequestException(
            `Channel ${channel.name} value ${channel.value} is not a boolean`,
          );
        }
      }
    }

    return true;
  }

  async bulkUpdateDeviceChannels(
    deviceId: number,
    templateId: string,
    channels: { name: string; value: ChannelValueType }[],
  ): Promise<Channel[]> {
    await this.validateChannelValue(channels, templateId);
    await this.channelModel.bulkWrite(
      channels.map((channel) => ({
        updateOne: {
          filter: { deviceId, name: channel.name },
          update: {
            $set: {
              value: channel.value,
              name: channel.name,
              deviceId,
              templateId,
            },
          },
          upsert: true,
        },
      })),
    );

    return this.channelModel.find({
      deviceId,
      name: { $in: channels.map((c) => c.name) },
    });
  }

  async updateDeviceChannel(
    deviceId: number,
    templateId: string,
    name: string,
    value: ChannelValueType,
  ): Promise<Channel> {
    const entityObject = await this.channelModel.findOneAndUpdate(
      { deviceId, name },
      { value },
      { new: true },
    );

    if (!entityObject) {
      const template = await this.templateService.findById(templateId);

      if (
        !template ||
        !template.channels.find((channel) => channel.name === name)
      ) {
        throw new NotFoundException('Channel not found');
      }

      const channel = await this.channelModel.create({
        deviceId,
        name,
        value,
      });

      return ChannelMapper.toDomain(channel);
    }
    return ChannelMapper.toDomain(entityObject);
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
