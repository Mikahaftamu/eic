import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampColumnsToCoveragePlan1712409000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the columns exist
    const columnsExist = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'coverage_plan' 
        AND column_name = 'createdAt'
      ) as "createdAtExists",
      EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'coverage_plan' 
        AND column_name = 'updatedAt'
      ) as "updatedAtExists";
    `) as Array<{ createdAtExists: boolean; updatedAtExists: boolean }>;

    const { createdAtExists, updatedAtExists } = columnsExist[0];

    // Add the columns if they don't exist
    if (!createdAtExists) {
      await queryRunner.query(`
        ALTER TABLE coverage_plan
        ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now();
      `);
    }

    if (!updatedAtExists) {
      await queryRunner.query(`
        ALTER TABLE coverage_plan
        ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns
    await queryRunner.query(`
      ALTER TABLE coverage_plan
      DROP COLUMN IF EXISTS "createdAt";
    `);

    await queryRunner.query(`
      ALTER TABLE coverage_plan
      DROP COLUMN IF EXISTS "updatedAt";
    `);
  }
} 