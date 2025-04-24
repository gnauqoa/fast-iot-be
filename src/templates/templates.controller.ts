import { Controller, Request, UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TemplateEntity } from './infrastructure/persistence/relational/entities/template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Crud,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@dataui/crud';
import { CrudController } from '@dataui/crud';
import { RolesGuard } from '../roles/roles.guard';
import { TemplateOwnershipGuard } from './template-ownership.guard';
import { RoleEnum } from '../roles/roles.enum';
import { UpdateTemplateDto } from './dto/update-template.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Crud({
  model: { type: TemplateEntity },
  query: {
    alwaysPaginate: true,
    maxLimit: 100,
    limit: 10,
    cache: 0,
    softDelete: true,
    join: {},
    sort: [{ field: 'createdAt', order: 'DESC' }],
  },
  routes: {
    exclude: ['replaceOneBase', 'recoverOneBase'],
  },
})
@ApiTags('Templates')
@Controller({
  path: 'templates',
  version: '1',
})
export class TemplatesController implements CrudController<TemplateEntity> {
  constructor(
    public service: TemplatesService,
    @InjectRepository(TemplateEntity) public repo: Repository<TemplateEntity>,
  ) {}

  get base(): CrudController<TemplateEntity> {
    return this;
  }

  @Override('getManyBase')
  async ovGetManyBase(
    @ParsedRequest() req: CrudRequest,
    @Request() request: any,
  ): Promise<any> {
    const user = request.user;
    const userId: number = user.id;
    const userRoleId: number = user.role.id;

    return await this.service.getMany({
      ...req,
      parsed: {
        ...req.parsed,
        search: {
          $or: [
            {
              $and: [
                ...(req.parsed.search?.$and || []),
                userRoleId !== RoleEnum.admin
                  ? { userId: { $eq: userId } }
                  : {},
              ],
            },
            userRoleId !== RoleEnum.admin ? { public: { $eq: true } } : {},
          ],
        },
      },
    });
  }

  @Override('getOneBase')
  @UseGuards(TemplateOwnershipGuard)
  ovGetOneBase(@Request() request: any): Promise<TemplateEntity> {
    return request.template;
  }

  @Override('updateOneBase')
  @UseGuards(TemplateOwnershipGuard)
  async ovUpdateOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: UpdateTemplateDto,
  ): Promise<TemplateEntity> {
    return await this.service.updateOne(req, {
      ...dto,
    });
  }

  @Override('deleteOneBase')
  @UseGuards(TemplateOwnershipGuard)
  async ovDeleteOneBase(
    @ParsedRequest() req: CrudRequest,
  ): Promise<void | TemplateEntity> {
    return await this.service.deleteOne(req);
  }
}
