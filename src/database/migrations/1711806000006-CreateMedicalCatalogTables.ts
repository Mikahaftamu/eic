import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { ServiceType } from '../../medical-catalog/entities/medical-service.entity';
import { MedicalItemType } from '../../medical-catalog/entities/medical-item.entity';

export class CreateMedicalCatalogTables1711806000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types first
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE service_type_enum AS ENUM (${Object.values(ServiceType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE medical_item_type_enum AS ENUM (${Object.values(MedicalItemType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      -- Create the update_updated_at_column function if it doesn't exist
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create medical_categories table
    await queryRunner.createTable(
      new Table({
        name: 'medical_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'parentCategoryId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create medical_services table
    await queryRunner.createTable(
      new Table({
        name: 'medical_services',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'codingSystem',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'service_type_enum',
            default: "'OTHER'",
            isNullable: false,
          },
          {
            name: 'categoryId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'basePrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'standardDuration',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'requiresPriorAuth',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'applicableDiagnosisCodes',
            type: 'varchar',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'placeOfServiceCodes',
            type: 'varchar',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'validModifiers',
            type: 'varchar',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'additionalProperties',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create medical_items table
    await queryRunner.createTable(
      new Table({
        name: 'medical_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'medical_item_type_enum',
            default: "'OTHER'",
            isNullable: false,
          },
          {
            name: 'categoryId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'basePrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'requiresPriorAuth',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'genericAlternatives',
            type: 'varchar',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'brandName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'additionalProperties',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKeys('medical_categories', [
      new TableForeignKey({
        columnNames: ['parentCategoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'medical_categories',
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['insuranceCompanyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'insurance_companies',
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createForeignKeys('medical_services', [
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'medical_categories',
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['insuranceCompanyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'insurance_companies',
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createForeignKeys('medical_items', [
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'medical_categories',
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['insuranceCompanyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'insurance_companies',
        onDelete: 'CASCADE',
      }),
    ]);

    // Add triggers for updatedAt
    await queryRunner.query(`
      CREATE TRIGGER update_medical_categories_updated_at
        BEFORE UPDATE ON medical_categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_medical_services_updated_at
        BEFORE UPDATE ON medical_services
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_medical_items_updated_at
        BEFORE UPDATE ON medical_items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers first
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_medical_categories_updated_at ON medical_categories;
      DROP TRIGGER IF EXISTS update_medical_services_updated_at ON medical_services;
      DROP TRIGGER IF EXISTS update_medical_items_updated_at ON medical_items;
    `);

    // Drop foreign keys
    await queryRunner.query(`
      ALTER TABLE medical_items DROP CONSTRAINT IF EXISTS "FK_medical_items_category";
      ALTER TABLE medical_items DROP CONSTRAINT IF EXISTS "FK_medical_items_insurance_company";
      ALTER TABLE medical_services DROP CONSTRAINT IF EXISTS "FK_medical_services_category";
      ALTER TABLE medical_services DROP CONSTRAINT IF EXISTS "FK_medical_services_insurance_company";
      ALTER TABLE medical_categories DROP CONSTRAINT IF EXISTS "FK_medical_categories_parent";
      ALTER TABLE medical_categories DROP CONSTRAINT IF EXISTS "FK_medical_categories_insurance_company";
    `);

    // Drop tables
    await queryRunner.dropTable('medical_items');
    await queryRunner.dropTable('medical_services');
    await queryRunner.dropTable('medical_categories');

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE IF EXISTS medical_item_type_enum;
      DROP TYPE IF EXISTS service_type_enum;
    `);
  }
} 