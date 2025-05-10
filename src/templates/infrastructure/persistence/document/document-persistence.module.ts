import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TemplateSchema, Templates } from './entities/template.schema';
import { TemplateRepository } from '../template.repository';
import { TemplateDocumentRepository } from './repositories/template.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Templates.name, schema: TemplateSchema },
    ]),
  ],
  providers: [
    {
      provide: TemplateRepository,
      useClass: TemplateDocumentRepository,
    },
  ],
  exports: [TemplateRepository],
})
export class DocumentTemplatePersistenceModule {}
