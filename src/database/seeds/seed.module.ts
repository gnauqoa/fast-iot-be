import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmConfigService } from '../typeorm-config.service';
import { RoleSeedModule } from './role/role-seed.module';
import { StatusSeedModule } from './status/status-seed.module';
import { UserSeedModule } from './user/user-seed.module';
import databaseConfig from '../config/database.config';
import appConfig from '../../config/app.config';
import { DeviceSeedModule } from './device/device-seed.module';
import { TemplateSeedModule } from './template/template-seed.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from '../mongoose-config.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from '../../cache/cache-config.service';

@Module({
  imports: [
    DeviceSeedModule,
    RoleSeedModule,
    StatusSeedModule,
    UserSeedModule,
    TemplateSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService,
    }),
  ],
})
export class SeedModule {}
