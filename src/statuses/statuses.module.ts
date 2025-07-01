import { Module } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { StatusesController } from './statuses.controller';
import { StatusEntity } from './infrastructure/persistence/relational/entities/status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StatusEntity])],
  controllers: [StatusesController],
  providers: [StatusesService],
  exports: [StatusesService, TypeOrmModule],
})
export class StatusesModule {}
