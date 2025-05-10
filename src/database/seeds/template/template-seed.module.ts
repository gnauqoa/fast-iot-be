import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TemplateSchema,
  Templates,
} from '../../../templates/infrastructure/persistence/document/entities/template.schema';
import { TemplateSeedService } from './template-seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MongooseModule.forFeature([
      {
        name: Templates.name,
        schema: TemplateSchema,
      },
    ]),
  ],
  providers: [TemplateSeedService],
  exports: [TemplateSeedService],
})
export class TemplateSeedModule {}
