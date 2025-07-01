import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RelationalUserPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersCrudService } from './users-crud.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './infrastructure/persistence/relational/entities/user.entity';

const infrastructurePersistenceModule = RelationalUserPersistenceModule;

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    infrastructurePersistenceModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersCrudService],
  exports: [UsersService, UsersCrudService, infrastructurePersistenceModule],
})
export class UsersModule {}
