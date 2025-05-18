import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    return {
      store: redisStore({
        host: this.configService.getOrThrow<string>('database.redisHost', {
          infer: true,
        }),
        port: this.configService.getOrThrow<number>('database.redisPort', {
          infer: true,
        }),
      }),
      ttl: this.configService.getOrThrow<number>('app.maxCacheTtl', {
        infer: true,
      }),
      max: this.configService.getOrThrow<number>('app.maxCacheItems', {
        infer: true,
      }),
    };
  }
}
