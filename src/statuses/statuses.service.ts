import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { StatusEntity } from './infrastructure/persistence/relational/entities/status.entity';

@Injectable()
export class StatusesService extends TypeOrmCrudService<StatusEntity> {
  constructor(@InjectRepository(StatusEntity) repo: Repository<StatusEntity>) {
    super(repo);
  }
}
