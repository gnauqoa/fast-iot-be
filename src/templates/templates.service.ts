import {
  // common
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { FindAllTemplatesDto } from './dto/find-all-templates.dto';
import { TemplateRepository } from './infrastructure/persistence/template.repository';
import { IPrototype, Template } from './domain/template';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TemplatesService {
  private readonly CACHE_KEY_PREFIX = 'template';
  private readonly CACHE_TTL = 3600; // Cache TTL in seconds (1 hour)

  constructor(
    // Dependencies here
    private readonly templateRepository: TemplateRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private async getTemplateFromCache(
    id: Template['id'],
  ): Promise<Template | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;
    return await this.cacheManager.get<Template>(cacheKey);
  }

  private async setTemplateCache(
    id: Template['id'],
    template: Template,
  ): Promise<void> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;
    await this.cacheManager.set(cacheKey, template, this.CACHE_TTL);
  }

  private async invalidateTemplateCache(id: Template['id']): Promise<void> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}:${id}`;
    await this.cacheManager.del(cacheKey);
  }

  async create(
    createTemplateDto: CreateTemplateDto,
    userId: number,
  ): Promise<Template> {
    try {
      const template = await this.templateRepository.create({
        ...createTemplateDto,
        userId,
        public: createTemplateDto.public ?? false,
      });
      await this.setTemplateCache(template.id, template);
      return template;
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

  async findById(id: Template['id']): Promise<Template> {
    // Try to get from cache first
    const cachedTemplate = await this.getTemplateFromCache(id);
    if (cachedTemplate) {
      return cachedTemplate;
    }

    const template = await this.templateRepository.findById(id);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    await this.setTemplateCache(id, template);

    return template;
  }

  async findByIds(ids: Template['id'][], userId: number): Promise<Template[]> {
    const cachedTemplates = await Promise.all(
      ids.map((id) => this.getTemplateFromCache(id)),
    );

    const cachedTemplateMap = new Map(
      cachedTemplates
        .filter((t): t is Template => t !== null)
        .map((t) => [t.id, t]),
    );

    const remainingIds = ids.filter((id) => !cachedTemplateMap.has(id));

    let templates: Template[] = [];
    if (remainingIds.length > 0) {
      templates = await this.templateRepository.findByIds(remainingIds);

      await Promise.all(
        templates.map((template) =>
          this.setTemplateCache(template.id, template),
        ),
      );
    }

    const allTemplates = [...cachedTemplateMap.values(), ...templates];

    return allTemplates.filter(
      (template) => template.userId === userId || template.public,
    );
  }

  async update(
    id: Template['id'],
    updateTemplateDto: UpdateTemplateDto,
  ): Promise<Template> {
    const template = await this.findById(id);

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

      await this.setTemplateCache(id, updatedTemplate);
      console.log('updatedTemplate123', updatedTemplate);

      return updatedTemplate;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Template with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: Template['id']): Promise<void> {
    await this.templateRepository.remove(id);
    await this.invalidateTemplateCache(id);
  }
}
