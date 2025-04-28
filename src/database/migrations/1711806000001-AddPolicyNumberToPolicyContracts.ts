import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPolicyNumberToPolicyContracts1711806000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First check if the column exists
    const table = await queryRunner.getTable('policy_contracts');
    const columnExists = table?.columns.find(column => column.name === 'policyNumber');

    if (!columnExists) {
      // Add policyNumber column to policy_contracts table
      await queryRunner.query(`
        ALTER TABLE policy_contracts
        ADD COLUMN "policyNumber" varchar NOT NULL UNIQUE;
      `);

      // Update existing records with a default value
      await queryRunner.query(`
        UPDATE policy_contracts
        SET "policyNumber" = 'POL-' || id::text
        WHERE "policyNumber" IS NULL;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove policyNumber column from policy_contracts table
    await queryRunner.query(`
      ALTER TABLE policy_contracts
      DROP COLUMN IF EXISTS "policyNumber";
    `);
  }
} 