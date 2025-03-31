import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { PolicyType } from '../../policy/enums/policy-type.enum';
import { ProductStatus } from '../../policy/enums/product-status.enum';
import { CoverageType } from '../../policy/enums/coverage-type.enum';
import { PremiumFrequency } from '../../policy/enums/premium-frequency.enum';
import { PremiumCalculationType } from '../../policy/enums/premium-calculation-type.enum';
import { LimitType } from '../../policy/enums/limit-type.enum';

export class CreatePolicyProductsTable1711804906000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create updated_at function if it doesn't exist
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE policy_type_enum AS ENUM (${Object.values(PolicyType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE product_status_enum AS ENUM (${Object.values(ProductStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE coverage_type_enum AS ENUM (${Object.values(CoverageType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE premium_frequency_enum AS ENUM (${Object.values(PremiumFrequency).map(freq => `'${freq}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE premium_calculation_type_enum AS ENUM (${Object.values(PremiumCalculationType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
      
      DO $$ BEGIN
        CREATE TYPE limit_type_enum AS ENUM (${Object.values(LimitType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create policy_products table
    await queryRunner.createTable(
      new Table({
        name: 'policy_products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
          },
          {
            name: 'code',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'type',
            type: 'policy_type_enum',
          },
          {
            name: 'status',
            type: 'product_status_enum',
            default: "'DRAFT'",
          },
          {
            name: 'coverageTypes',
            type: 'coverage_type_enum',
            isArray: true,
          },
          {
            name: 'waitingPeriod',
            type: 'integer',
            default: 0,
          },
          {
            name: 'maxMembers',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'premium',
            type: 'jsonb',
          },
          {
            name: 'benefits',
            type: 'jsonb',
          },
          {
            name: 'eligibilityRules',
            type: 'jsonb',
          },
          {
            name: 'validFrom',
            type: 'timestamp',
          },
          {
            name: 'validTo',
            type: 'timestamp',
            isNullable: true,
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
          },
        ],
      }),
      true,
    );

    // Add foreign key
    await queryRunner.createForeignKey(
      'policy_products',
      new TableForeignKey({
        columnNames: ['insuranceCompanyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'insurance_companies',
        onDelete: 'CASCADE',
      }),
    );

    // Add triggers for updatedAt
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_policy_products_updated_at ON policy_products;
      CREATE TRIGGER update_policy_products_updated_at
        BEFORE UPDATE ON policy_products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_policy_products_updated_at ON policy_products;`);
    await queryRunner.dropForeignKey('policy_products', 'FK_policy_products_insurance_company');
    await queryRunner.dropTable('policy_products');
    await queryRunner.query(`
      DROP TYPE IF EXISTS policy_type_enum;
      DROP TYPE IF EXISTS product_status_enum;
      DROP TYPE IF EXISTS coverage_type_enum;
      DROP TYPE IF EXISTS premium_frequency_enum;
      DROP TYPE IF EXISTS premium_calculation_type_enum;
      DROP TYPE IF EXISTS limit_type_enum;
    `);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column;`);
  }
}
