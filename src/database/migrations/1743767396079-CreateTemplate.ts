import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateTemplate1743767396079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the 'templates' table
    await queryRunner.createTable(
      new Table({
        name: 'template',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'prototype',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'public',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.addColumns('device', [
      new TableColumn({
        name: 'templateId',
        type: 'varchar',
        isNullable: true, // Change to false if it should be required
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the 'templates' table
    await queryRunner.dropTable('template');

    // Remove 'templateId' column from the 'devices' table
    await queryRunner.dropColumn('device', 'templateId');
  }
}
