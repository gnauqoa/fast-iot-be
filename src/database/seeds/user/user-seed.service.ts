import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../roles/roles.enum';
import { StatusEnum } from '../../../statuses/statuses.enum';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async run() {
    const adminLongitude = 106.706945;
    const adminLatitude = 10.808147;

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash('secret', salt);
    const adminUser = await this.repository.findOne({
      where: {
        email: 'admin@example.com',
      },
    });
    if (!adminUser) {
      const admin = await this.repository.save(
        this.repository.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          password,
          role: {
            id: RoleEnum.admin,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
          positionUpdatedAt: new Date(),
        }),
      );

      await this.repository
        .createQueryBuilder()
        .update(UserEntity)
        .set({
          position: () =>
            `ST_SetSRID(ST_MakePoint(${adminLongitude}, ${adminLatitude}), 4326)`,
        })
        .where('id = :id', { id: admin.id })
        .execute();
    }

    const countUser = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.user,
        },
      },
    });

    if (!countUser) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password,
          role: {
            id: RoleEnum.user,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
          positionUpdatedAt: new Date(),
        }),
      );
    }
  }
}
