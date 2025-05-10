import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { redisStore } from 'cache-manager-ioredis-yet';

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
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>(
          'database.workerHost',
          {
            infer: true,
          },
        );
        return {
          store: redisStore(),
          url: redisUrl,
          ttl: 60, // default TTL in seconds
        };
      },
    }),
  ],
})
export class SeedModule {}
