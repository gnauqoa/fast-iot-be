import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFullNameIndexToUser1743832019405 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX idx_user_fullname_fts
        ON "user"
        USING GIN (
            to_tsvector('simple', coalesce("firstName", '') || ' ' || coalesce("lastName", ''))
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DROP INDEX "idx_user_fullname_fts";
        `);
  }
}
