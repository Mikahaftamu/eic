import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToCoveragePlan1712409000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'coverage_plan' 
        AND column_name = 'isActive'
      );
    `) as Array<{ exists: boolean }>;

    if (!columnExists[0].exists) {
      // Add the column if it doesn't exist
      await queryRunner.query(`
        ALTER TABLE coverage_plan
        ADD COLUMN "isActive" boolean NOT NULL DEFAULT true;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the column
    await queryRunner.query(`
      ALTER TABLE coverage_plan
      DROP COLUMN IF EXISTS "isActive";
    `);
  }
} 