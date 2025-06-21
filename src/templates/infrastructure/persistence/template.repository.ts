import { FilterQuery } from 'mongoose';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Template } from '../../domain/template';

export abstract class TemplateRepository {
  abstract create(
    data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Template>;

  abstract find(): Promise<Template[]>;

  abstract findAllWithPagination({
    paginationOptions,
    query,
  }: {
    paginationOptions: IPaginationOptions;
    query: FilterQuery<Template>;
  }): Promise<{ data: Template[]; total: number }>;

  abstract findById(id: Template['id']): Promise<NullableType<Template>>;

  abstract findByIds(ids: Template['id'][]): Promise<Template[]>;

  abstract update(
    id: Template['id'],
    payload: DeepPartial<Template>,
  ): Promise<Template | null>;

  abstract remove(id: Template['id']): Promise<void>;
}
