import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';

import appConfig from '../../../config/app.config';
import databaseConfig from '../../config/database.config';
import { MongooseConfigService } from '../../mongoose-config.service';
import { ChannelSeedModule } from './channel/channel-seed.module';

@Module({
  imports: [
    ChannelSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
  ],
})
export class SeedModule {}
