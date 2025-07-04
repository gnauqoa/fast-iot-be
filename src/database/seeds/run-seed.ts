import { NestFactory } from '@nestjs/core';
import { DeviceSeedService } from './device/device-seed.service';
import { RoleSeedService } from './role/role-seed.service';
import { SeedModule } from './seed.module';
import { StatusSeedService } from './status/status-seed.service';
import { UserSeedService } from './user/user-seed.service';
import { TemplateSeedService } from './template/template-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(RoleSeedService).run();
  await app.get(StatusSeedService).run();
  await app.get(UserSeedService).run();
  await app.get(TemplateSeedService).run();
  await app.get(DeviceSeedService).run();

  await app.close();
};

void runSeed()
  .then(() => {
    console.log('✅ Seeding completed');
    process.exit(0); // Ensure exit
  })
  .catch((err) => {
    console.error('❌ Seeding failed', err);
    process.exit(1);
  });
