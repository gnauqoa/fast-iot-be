import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationTokenToUser1749890614709
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" ADD COLUMN "firebaseToken" VARCHAR;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "firebaseToken";
        `);
  }
}
