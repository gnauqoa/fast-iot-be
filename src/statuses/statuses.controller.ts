import { Controller, UseGuards } from '@nestjs/common';
import {
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedBody,
  ParsedRequest,
} from '@dataui/crud';
import { StatusEntity } from './infrastructure/persistence/relational/entities/status.entity';
import { StatusesService } from './statuses.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateStatusDto } from './dto/create-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { RoleEnum } from 'src/roles/roles.enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { AuthGuard } from '@nestjs/passport';

@Crud({
  model: { type: StatusEntity },
  dto: {
    create: CreateStatusDto,
    update: CreateStatusDto,
  },
  query: {
    alwaysPaginate: false,
    limit: 100,
    cache: 2000,
  },
  routes: {
    exclude: ['replaceOneBase', 'createManyBase', 'recoverOneBase'],
  },
})
@ApiBearerAuth()
@ApiTags('Statuses')
@Controller({ path: 'statuses', version: '1' })
export class StatusesController implements CrudController<StatusEntity> {
  constructor(
    public service: StatusesService,
    @InjectRepository(StatusEntity)
    private statusRepository: Repository<StatusEntity>,
  ) {}

  get base(): CrudController<StatusEntity> {
    return this;
  }

  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Override('createOneBase')
  async ovCreateOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateStatusDto,
  ): Promise<StatusEntity> {
    const lastStatus = await this.statusRepository.findOne({
      select: ['id'],
      where: { id: Not(IsNull()) },
      order: {
        id: 'DESC',
      },
    });
    return await this.service.createOne(req, {
      ...dto,
      id: lastStatus ? lastStatus.id + 1 : 1,
    });
  }

  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Override('updateOneBase')
  async ovUpdateOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateStatusDto,
  ): Promise<StatusEntity> {
    return await this.service.updateOne(req, dto);
  }

  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Override('deleteOneBase')
  async ovDeleteOneBase(
    @ParsedRequest() req: CrudRequest,
  ): Promise<void | StatusEntity> {
    return await this.service.deleteOne(req);
  }

  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Override('getOneBase')
  async ovGetOneBase(@ParsedRequest() req: CrudRequest): Promise<StatusEntity> {
    return await this.service.getOne(req);
  }
}
