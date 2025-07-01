import { Body, Controller, Patch, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../roles/roles.guard';
import {
  Crud,
  CrudController,
  CrudRequest,
  Override,
  ParsedRequest,
} from '@dataui/crud';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';
import { UsersCrudService } from './users-crud.service';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Crud({
  model: {
    type: UserEntity,
  },
  dto: {
    create: CreateUserDto,
    update: UpdateUserDto,
  },
  query: {
    exclude: ['password'],
    softDelete: true,
    alwaysPaginate: true,
    maxLimit: 100,
    limit: 10,
    join: {
      role: { eager: true },
      status: { eager: true },
    },
    cache: 0,
  },
})
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController implements CrudController<UserEntity> {
  constructor(public service: UsersCrudService) {}

  @Override('getManyBase')
  async ovGetManyBase(@ParsedRequest() req: CrudRequest): Promise<any> {
    const searchAnd = req.parsed.search.$and;
    const newCondition: { [key: string]: string } = {};

    if (searchAnd && searchAnd.length > 2) {
      const condition = searchAnd[2]?.$and as Array<{
        fullName?: { $contL: string };
        'status.name'?: { $eq: string };
        'role.name'?: { $eq: string };
      }>;

      condition.forEach((item) => {
        const key = Object.keys(item)[0];
        const value = item[key];

        newCondition[key] = value[Object.keys(value)[0]];
      });
    }

    return this.service.fullTextSearch({
      fullName: newCondition['fullName'],
      statusName: newCondition['status.name'],
      roleName: newCondition['role.name'],
      page: req.parsed.page,
      limit: req.parsed.limit,
    });
  }

  @Patch(':id/password')
  async updatePassword(
    @Request() request: any,
    @Body() dto: UpdateUserPasswordDto,
  ): Promise<UserEntity> {
    const user = request.user;
    const currentUserId: number = user.id;
    const userRoleId: number = user.role.id;

    return await this.service.updatePassword({
      currentUserId,
      userRoleId,
      userUpdateId: Number(request.params.id) || currentUserId,
      password: dto.password || '',
      previousPassword: dto?.previousPassword || '',
    });
  }
}
