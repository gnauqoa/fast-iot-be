import {
  // common
  Injectable,
} from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { ChannelRepository } from './infrastructure/persistence/channel.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Channel } from './domain/channel';

@Injectable()
export class ChannelsService {
  constructor(
    // Dependencies here
    private readonly channelRepository: ChannelRepository,
  ) {}

  async getDeviceChannel(deviceId: number) {
    return this.channelRepository.getDeviceChannel(deviceId);
  }

  async create(createChannelDto: CreateChannelDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.channelRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      ...createChannelDto,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.channelRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Channel['id']) {
    return this.channelRepository.findById(id);
  }

  findByIds(ids: Channel['id'][]) {
    return this.channelRepository.findByIds(ids);
  }

  async update(
    id: Channel['id'],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateChannelDto: UpdateChannelDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.channelRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: Channel['id']) {
    return this.channelRepository.remove(id);
  }
}
