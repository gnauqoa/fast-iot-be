import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPositionToUser1749898437140 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          ALTER TABLE "user"
          ADD COLUMN "position" geometry(Point, 4326) NOT NULL DEFAULT ST_SetSRID(ST_MakePoint(0, 0), 4326);
        `);
    await queryRunner.query(`
          CREATE INDEX "idx_user_position" ON "user" USING GIST ("position");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DROP INDEX "idx_user_position";
        `);
    await queryRunner.query(`
          ALTER TABLE "user" DROP COLUMN "position";
        `);
  }
}
