import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDeviceUserIdNullable1745464805229 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "device"
            ALTER COLUMN "userId" DROP NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "device"
            ALTER COLUMN "userId" SET NOT NULL;
        `);
    }

}
