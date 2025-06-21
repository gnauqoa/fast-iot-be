import { Injectable } from '@nestjs/common';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Templates } from '../entities/template.schema';
import { TemplateRepository } from '../../template.repository';
import { Template } from '../../../../domain/template';
import { TemplateMapper } from '../mappers/template.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { DeepPartial } from '../../../../../utils/types/deep-partial.type';

@Injectable()
export class TemplateDocumentRepository implements TemplateRepository {
  constructor(
    @InjectModel(Templates.name)
    private readonly templateModel: Model<Templates>,
  ) {}

  async create(data: Template): Promise<Template> {
    const persistenceModel = TemplateMapper.toPersistence(data);
    const createdEntity = new this.templateModel(persistenceModel);
    const entityObject = await createdEntity.save();
    return TemplateMapper.toDomain(entityObject);
  }

  async find(): Promise<Template[]> {
    const entityObjects = await this.templateModel.find();
    return entityObjects.map((entityObject) =>
      TemplateMapper.toDomain(entityObject),
    );
  }

  async findAllWithPagination({
    paginationOptions,
    query,
  }: {
    paginationOptions: IPaginationOptions;
    query: FilterQuery<Template>;
  }): Promise<{ data: Template[]; total: number }> {
    const entityObjects = await this.templateModel
      .find(query)
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit);

    const total = await this.templateModel.countDocuments(query);

    return {
      data: entityObjects.map((entityObject) =>
        TemplateMapper.toDomain(entityObject),
      ),
      total,
    };
  }

  async findById(id: Template['id']): Promise<NullableType<Template>> {
    const entityObject = await this.templateModel.findById(id);
    return entityObject ? TemplateMapper.toDomain(entityObject) : null;
  }

  async findByIds(ids: Template['id'][]): Promise<Template[]> {
    const entityObjects = await this.templateModel.find({ _id: { $in: ids } });
    return entityObjects.map((entityObject) =>
      TemplateMapper.toDomain(entityObject),
    );
  }

  async update(
    id: Template['id'],
    payload: DeepPartial<Template>,
  ): Promise<Template | null> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id?.toString() };
    const entity = await this.templateModel.findOne(filter);

    if (!entity) {
      throw new Error('Record not found');
    }

    const entityObject = await this.templateModel.findOneAndUpdate(
      filter,
      {
        $set: TemplateMapper.toPersistence({
          ...TemplateMapper.toDomain(entity),
          ...clonedPayload,
        } as Template),
      },
      { new: true },
    );

    return entityObject ? TemplateMapper.toDomain(entityObject) : null;
  }

  async remove(id: Template['id']): Promise<void> {
    await this.templateModel.deleteOne({ _id: id });
  }
}
