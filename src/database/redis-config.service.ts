import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  get redisUrl(): string {
    return this.configService.getOrThrow<string>('database.redisHost', {
      infer: true,
    });
  }

  getCacheOptions() {
    return {
      store: async () =>
        (await import('cache-manager-ioredis-yet')).redisStore(),
      url: this.redisUrl,
      ttl: 60,
    };
  }
}
