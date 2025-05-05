import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Channels } from '../../../../channels/infrastructure/persistence/document/entities/channel.schema';
import { Model } from 'mongoose';

@Injectable()
export class ChannelSeedService {
  constructor(
    @InjectModel(Channels.name)
    private readonly model: Model<Channels>,
  ) {}

  async run() {}
}
