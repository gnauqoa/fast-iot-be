import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { Templates } from '../../../templates/infrastructure/persistence/document/entities/template.schema';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelType } from '../../../templates/domain/enums/channel-type.enum';
import {
  ACCIDENT_CHANNEL_NAME,
  STATUS_CHANNEL_OPTIONS,
} from '../../../../test/utils/constants';

@Injectable()
export class TemplateSeedService {
  constructor(
    @InjectModel(Templates.name)
    private readonly model: Model<Templates>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private generateTemplate(userId: number) {
    return {
      name:
        faker.helpers.arrayElement(['Motorbike Rescue']) +
        ' Template ' +
        faker.number.int({ min: 1, max: 100 }),
      description: faker.lorem.paragraph(),
      userId,
      public: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      channels: [
        {
          name: ACCIDENT_CHANNEL_NAME,
          type: ChannelType.SELECT,
          options: STATUS_CHANNEL_OPTIONS,
        },
      ],
    };
  }

  async run() {
    const users = await this.userRepository.find();

    await this.model.deleteMany();

    const templates = Array.from({ length: 1 }, () => {
      const randomUser = faker.helpers.arrayElement(users);
      return this.generateTemplate(randomUser.id);
    });
    await this.model.insertMany(templates);
    console.log('✅ Templates seeded successfully');
  }
}
