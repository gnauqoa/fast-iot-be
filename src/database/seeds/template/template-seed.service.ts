import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { Templates } from '../../../templates/infrastructure/persistence/document/entities/template.schema';
import { ChannelType } from '../../../templates/domain/enums/channel-type.enum';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TemplateSeedService {
  constructor(
    @InjectModel(Templates.name)
    private readonly model: Model<Templates>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private generateChannel() {
    const type = faker.helpers.arrayElement(Object.values(ChannelType));
    return {
      name: faker.helpers.arrayElement([
        'Temperature',
        'Humidity',
        'Pressure',
        'Light',
      ]),
      type,
    };
  }

  private generatePrototype() {
    return {
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
      nodes: [],
      edges: [],
    };
  }

  private generateTemplate(userId: number) {
    const channelCount = faker.number.int({ min: 2, max: 8 });
    const channels = Array.from({ length: channelCount }, () =>
      this.generateChannel(),
    );

    return {
      name:
        faker.helpers.arrayElement([
          'Smart Home',
          'Industrial IoT',
          'Environmental Monitoring',
          'Energy Management',
          'Security System',
          'Healthcare Monitoring',
          'Agriculture IoT',
          'Smart City',
          'Asset Tracking',
          'Predictive Maintenance',
        ]) +
        ' Template ' +
        faker.number.int({ min: 1, max: 100 }),
      description: faker.lorem.paragraph(),
      userId,
      public: true,
      channels,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };
  }

  async run() {
    const users = await this.userRepository.find();

    await this.model.deleteMany();

    const templates = Array.from({ length: 20 }, () => {
      const randomUser = faker.helpers.arrayElement(users);
      return this.generateTemplate(randomUser.id);
    });
    await this.model.insertMany(templates);
    console.log('✅ Templates seeded successfully');
  }
}
