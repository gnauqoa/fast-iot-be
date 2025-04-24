import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateEntity } from './infrastructure/persistence/relational/entities/template.entity';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';

@Injectable()
export class TemplatesService extends TypeOrmCrudService<TemplateEntity> {
  constructor(
    @InjectRepository(TemplateEntity) repo: Repository<TemplateEntity>,
  ) {
    super(repo);
  }
}
