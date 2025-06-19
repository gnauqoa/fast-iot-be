import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPositionUpdatedAtToUser1750177580202
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD COLUMN "position_updated_at" TIMESTAMP NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "position_updated_at"`,
    );
  }
}
