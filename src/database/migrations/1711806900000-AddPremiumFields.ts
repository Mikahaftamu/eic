// src/database/migrations/1711806900000-AddPremiumFields.ts

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPremiumFields1711806900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Check and drop columns if they exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policy_products' AND column_name = 'basePremium') THEN
          ALTER TABLE policy_products DROP COLUMN "basePremium";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policy_products' AND column_name = 'coverageType') THEN
          ALTER TABLE policy_products DROP COLUMN "coverageType";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'policy_products' AND column_name = 'premiumModifiers') THEN
          ALTER TABLE policy_products DROP COLUMN "premiumModifiers";
        END IF;
      END $$;
    `);

    // Step 2: Add columns as nullable
    await queryRunner.query(`
      ALTER TABLE policy_products 
      ADD COLUMN "basePremium" numeric(10,2),
      ADD COLUMN "coverageType" varchar(50),
      ADD COLUMN "premiumModifiers" jsonb
    `);

    // Step 3: Set default values
    await queryRunner.query(`
      UPDATE policy_products 
      SET 
        "basePremium" = 0,
        "coverageType" = 'BASIC',
        "premiumModifiers" = '${JSON.stringify({
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
        })}'::jsonb
    `);

    // Step 4: Make columns NOT NULL
    await queryRunner.query(`
      ALTER TABLE policy_products 
      ALTER COLUMN "basePremium" SET NOT NULL,
      ALTER COLUMN "coverageType" SET NOT NULL,
      ALTER COLUMN "premiumModifiers" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE policy_products 
      DROP COLUMN IF EXISTS "premiumModifiers",
      DROP COLUMN IF EXISTS "coverageType",
      DROP COLUMN IF EXISTS "basePremium"
    `);
  }
}
