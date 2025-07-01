import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserSeedService } from './user-seed.service';
import { UserEntity } from '../../../users/infrastructure/persistence/relational/entities/user.entity';
import { DeviceEntity } from '../../../devices/infrastructure/persistence/relational/entities/device.entity';
import { SessionEntity } from '../../../session/infrastructure/persistence/relational/entities/session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, DeviceEntity, SessionEntity]),
  ],
  providers: [UserSeedService],
  exports: [UserSeedService],
})
export class UserSeedModule {}
