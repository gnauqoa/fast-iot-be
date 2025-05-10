import {
  // common
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FindAllTemplatesDto } from './dto/find-all-templates.dto';
import { TemplateRepository } from './infrastructure/persistence/template.repository';
import { IPrototype, Template } from './domain/template';
import { DeepPartial } from '../utils/types/deep-partial.type';

@Injectable()
export class TemplatesService {
  constructor(
    // Dependencies here
    private readonly templateRepository: TemplateRepository,
  ) {}

  async create(
    createTemplateDto: CreateTemplateDto,
    userId: number,
  ): Promise<Template> {
    try {
      return await this.templateRepository.create({
        ...createTemplateDto,
        userId,
        public: createTemplateDto.public ?? false,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Template with this name already exists');
      }
      throw error;
    }
  }

  async findAll(findAllTemplatesDto: FindAllTemplatesDto, userId: number) {
    const {
      page = 1,
      limit = 10,
      search,
      public: isPublic,
      userId: filterUserId,
    } = findAllTemplatesDto;

    const query: any = {
      deletedAt: null,
    };

    // Add search condition if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Add public filter if provided
    if (isPublic !== undefined) {
      query.public = isPublic;
    }

    // Add user filter
    if (filterUserId) {
      query.userId = filterUserId;
    } else {
      // If no specific user filter, show user's templates and public templates
      query.$or = [{ userId }, { public: true }];
    }

    return this.templateRepository.findAllWithPagination({
      paginationOptions: {
        page,
        limit,
      },
    });
  }

  async findById(id: Template['id'], userId: number): Promise<Template> {
    const template = await this.templateRepository.findById(id);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check if user has access to the template
    if (template.userId !== userId && !template.public) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async findByIds(ids: Template['id'][], userId: number): Promise<Template[]> {
    const templates = await this.templateRepository.findByIds(ids);

    // Filter out templates that user doesn't have access to
    return templates.filter(
      (template) => template.userId === userId || template.public,
    );
  }

  async update(
    id: Template['id'],
    updateTemplateDto: UpdateTemplateDto,
    userId: number,
  ): Promise<Template> {
    const template = await this.findById(id, userId);

    // Check if user is the owner
    if (template.userId !== userId) {
      throw new BadRequestException('You can only update your own templates');
    }
    try {
      const updateData: DeepPartial<Template> = {
        name: updateTemplateDto.name,
        description: updateTemplateDto.description,
        channels: updateTemplateDto.channels,
        desktopPrototype:
          updateTemplateDto.desktopPrototype as DeepPartial<IPrototype>,
        mobilePrototype:
          updateTemplateDto.mobilePrototype as DeepPartial<IPrototype>,
        public: updateTemplateDto.public ?? template.public,
      };
      const updatedTemplate = await this.templateRepository.update(
        id,
        updateData,
      );
      if (!updatedTemplate) {
        throw new NotFoundException('Template not found');
      }
      return updatedTemplate;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Template with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: Template['id'], userId: number): Promise<void> {
    const template = await this.findById(id, userId);

    // Check if user is the owner
    if (template.userId !== userId) {
      throw new BadRequestException('You can only delete your own templates');
    }

    await this.templateRepository.remove(id);
  }
}
