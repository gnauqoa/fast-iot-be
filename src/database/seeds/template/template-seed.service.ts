import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { faker } from '@faker-js/faker';
import { Templates } from '../../../templates/infrastructure/persistence/document/entities/template.schema';
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

  private generateTemplate(userId: number) {
    return {
      name:
        faker.helpers.arrayElement(['Fast IoT']) +
        ' Template ' +
        faker.number.int({ min: 1, max: 100 }),
      description: faker.lorem.paragraph(),
      userId,
      public: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      channels: [
        {
          name: 'v1',
          type: 'Boolean',
          options: [],
        },
        {
          name: 'v2',
          type: 'String',
          options: [],
        },
      ],
      desktopPrototype: {
        nodes: [
          {
            id: '1',
            type: 'button',
            position: {
              x: 215.00692749023438,
              y: 300.0138854980469,
            },
            data: {
              label: 'Led',
              channel: 'v1',
            },
            measured: {
              width: 200,
              height: 100,
            },
            selected: false,
            dragging: false,
          },
          {
            id: '2',
            type: 'label',
            position: {
              x: 216.51039123535156,
              y: 121.02082824707031,
            },
            data: {
              label: 'Temp',
              channel: 'v2',
            },
            measured: {
              width: 200,
              height: 100,
            },
            selected: false,
            dragging: false,
          },
          {
            id: '3',
            type: 'label',
            position: {
              x: 455.51039123535156,
              y: 121.52082824707031,
            },
            data: {
              label: 'Humi',
              channel: 'v2',
            },
            measured: {
              width: 200,
              height: 100,
            },
            selected: false,
            dragging: false,
          },
        ],
      },
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
