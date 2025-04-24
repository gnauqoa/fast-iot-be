import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TemplateEntity } from '../../../../templates/infrastructure/persistence/relational/entities/template.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

@Injectable()
export class TemplateSeedService {
  constructor(
    @InjectRepository(TemplateEntity)
    private repository: Repository<TemplateEntity>,
  ) {}

  async run() {
    await this.repository.delete({});

    const templates = this.repository.create(
      Array.from({ length: 10 }, () => ({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        userId: 1,
        public: faker.datatype.boolean(),
      })),
    );

    await this.repository.save(templates);
  }
}
