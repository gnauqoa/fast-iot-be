import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';
import { RoleEnum } from '../roles/roles.enum';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersCrudService extends TypeOrmCrudService<UserEntity> {
  constructor(@InjectRepository(UserEntity) repo) {
    super(repo);
  }

  async fullTextSearch({
    fullName,
    statusName,
    roleName,
    page,
    limit,
  }: {
    fullName?: string;
    statusName?: string;
    roleName?: string;
    page: number;
    limit: number;
  }) {
    const queryBuilder = this.repo.createQueryBuilder('user');

    queryBuilder
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.role', 'role');

    if (!fullName && !statusName && !roleName) {
      const [items, total] = await queryBuilder.getManyAndCount();
      return {
        count: total,
        data: items,
        page,
        pageCount: Math.ceil(total / limit),
        limit,
      };
    }

    if (fullName) {
      queryBuilder.andWhere(
        `
        to_tsvector('simple', coalesce("user"."firstName", '') || ' ' || coalesce("user"."lastName", ''))
        @@ to_tsquery('simple', :query)
      `,
        { query: this.formatPrefixQuery(fullName) },
      );
    }

    if (statusName) {
      queryBuilder.andWhere('status.name = :statusName', {
        statusName,
      });
    }

    if (roleName) {
      queryBuilder.andWhere('role.name = :roleName', {
        roleName,
      });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      count: total,
      data: items,
      page,
      pageCount: Math.ceil(total / limit),
      limit,
    };
  }

  private formatPrefixQuery(input: string): string {
    return input
      .trim()
      .split(/\s+/)
      .map((word) => `${word}:*`)
      .join(' & ');
  }

  async updatePassword({
    currentUserId,
    userRoleId,
    userUpdateId,
    password,
    previousPassword,
  }: {
    currentUserId: number;
    userRoleId: number;
    userUpdateId: number;
    password: string;
    previousPassword: string;
  }): Promise<UserEntity> {
    if (userUpdateId !== currentUserId && userRoleId !== RoleEnum.admin) {
      throw new BadRequestException(
        'You are not authorized to update this user',
      );
    }

    const user = await this.repo.findOne({ where: { id: userUpdateId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userRoleId !== RoleEnum.admin || userUpdateId === currentUserId) {
      if (user.password !== (await bcrypt.hash(previousPassword, 10))) {
        throw new BadRequestException('Previous password is incorrect');
      }
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.repo.update(userUpdateId, { password: hashedPassword });

    return user;
  }
}
