import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';
import { createPointExpression } from '../utils/position';
import { UpdateUserPositionDto } from './dto/update-user-position.dto';

@Injectable()
export class UsersCrudService extends TypeOrmCrudService<UserEntity> {
  constructor(@InjectRepository(UserEntity) repo) {
    super(repo);
  }

  async updatePosition(
    id: number,
    dto: UpdateUserPositionDto,
  ): Promise<UserEntity> {
    const longitude = dto.longitude;
    const latitude = dto.latitude;

    return this.repo
      .createQueryBuilder()
      .update(UserEntity)
      .set({
        position: () => createPointExpression(longitude, latitude),
      })
      .where('id = :id', { id })
      .execute()
      .then(() => this.repo.findOneByOrFail({ id }));
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
}
