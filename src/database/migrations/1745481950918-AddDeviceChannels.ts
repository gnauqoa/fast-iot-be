import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceChannels1745481950918 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE device
            ADD COLUMN channels JSON
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE device
            DROP COLUMN channels
        `);
  }
}
