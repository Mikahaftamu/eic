import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAdditionalDiagnosisCodesType1712409000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First check if the column exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'claims' 
        AND column_name = 'additionalDiagnosisCodes'
      );
    `);

    if (columnExists[0].exists) {
      // Drop the existing column
      await queryRunner.query(`
        ALTER TABLE claims
        DROP COLUMN IF EXISTS "additionalDiagnosisCodes";
      `);
    }

    // Add the column with the new type
    await queryRunner.query(`
      ALTER TABLE claims
      ADD COLUMN "additionalDiagnosisCodes" text[] NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First check if the column exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'claims' 
        AND column_name = 'additionalDiagnosisCodes'
      );
    `);

    if (columnExists[0].exists) {
      // Drop the column
      await queryRunner.query(`
        ALTER TABLE claims
        DROP COLUMN IF EXISTS "additionalDiagnosisCodes";
      `);

      // Add back the original column type
      await queryRunner.query(`
        ALTER TABLE claims
        ADD COLUMN "additionalDiagnosisCodes" text NULL;
      `);
    }
  }
} 