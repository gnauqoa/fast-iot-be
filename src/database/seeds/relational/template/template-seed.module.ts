import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateEntity } from '../../../../templates/infrastructure/persistence/relational/entities/template.entity';
import { TemplateSeedService } from './template-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateEntity])],
  providers: [TemplateSeedService],
  exports: [TemplateSeedService],
})
export class TemplateSeedModule {}
