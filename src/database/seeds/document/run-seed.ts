import { NestFactory } from '@nestjs/core';

import { SeedModule } from './seed.module';
import { ChannelSeedService } from './channel/channel-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  await app.get(ChannelSeedService).run();
  await app.close();
};

void runSeed();
