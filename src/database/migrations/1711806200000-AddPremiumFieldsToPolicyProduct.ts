// src/database/migrations/1711806200000-AddPremiumFieldsToPolicyProduct.ts
import { MigrationInterface, QueryRunner } from 'typeorm';
import { CoverageType } from '../../policy/enums/coverage-type.enum';

export class AddPremiumFieldsToPolicyProduct1711806200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Start a transaction
    await queryRunner.startTransaction();

    try {
      // Add coverage_type enum
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE coverage_type_enum AS ENUM (${Object.values(CoverageType).map(type => `'${type}'`).join(', ')});
          EXCEPTION WHEN duplicate_object THEN null;
        END $$;
      `);

      // Add columns with defaults in a single step
      await queryRunner.query(`
        ALTER TABLE policy_products
        ADD COLUMN "basePremium" numeric(10,2) DEFAULT 0 NOT NULL,
        ADD COLUMN "coverageType" coverage_type_enum DEFAULT 'BASIC' NOT NULL,
        ADD COLUMN "premiumModifiers" jsonb DEFAULT '${JSON.stringify({
          ageFactors: [
            { minAge: 0, maxAge: 17, factor: 0.5 },
            { minAge: 18, maxAge: 29, factor: 0.8 },
            { minAge: 30, maxAge: 39, factor: 1.0 },
            { minAge: 40, maxAge: 49, factor: 1.2 },
            { minAge: 50, maxAge: 59, factor: 1.5 },
            { minAge: 60, maxAge: 69, factor: 2.0 },
            { minAge: 70, maxAge: 999, factor: 2.5 },
          ],
          familySizeFactors: [
            { size: 1, factor: 1.0 },
            { size: 2, factor: 1.8 },
            { size: 3, factor: 2.4 },
            { size: 4, factor: 2.8 },
            { size: 5, factor: 3.0 },
            { size: 6, factor: 3.2 },
          ],
          loadingFactors: [],
          discountFactors: [],
        })}' NOT NULL
      `);

      // Remove the default constraints after setting the values
      await queryRunner.query(`
        ALTER TABLE policy_products
        ALTER COLUMN "basePremium" DROP DEFAULT,
        ALTER COLUMN "coverageType" DROP DEFAULT,
        ALTER COLUMN "premiumModifiers" DROP DEFAULT
      `);

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (err) {
      // If we encounter any error, rollback the changes
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      await queryRunner.query('ALTER TABLE policy_products DROP COLUMN "premiumModifiers"');
      await queryRunner.query('ALTER TABLE policy_products DROP COLUMN "coverageType"');
      await queryRunner.query('ALTER TABLE policy_products DROP COLUMN "basePremium"');
      await queryRunner.query('DROP TYPE IF EXISTS coverage_type_enum');

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    }
  }
}
