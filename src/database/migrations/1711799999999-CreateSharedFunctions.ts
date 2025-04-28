import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSharedFunctions1711799999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create shared function for updating updatedAt timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(): Promise<void> {
    // Note: We don't drop the function here as it's used by other tables
    // The function will be dropped when all dependent triggers are removed
  }
} 