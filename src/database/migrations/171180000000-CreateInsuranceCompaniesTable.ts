import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInsuranceCompaniesTable1711800000000 implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void>
  {
    // Step 1: Create updated_at trigger function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Step 2: Create the insurance_companies table
    await queryRunner.createTable(
      new Table({
        name: 'insurance_companies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'code',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
          },
          {
            name: 'address',
            type: 'varchar',
          },
          {
            name: 'website',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'license',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
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

    // Step 3: Create trigger
    await queryRunner.query(`
      CREATE TRIGGER update_insurance_companies_updated_at
      BEFORE UPDATE ON insurance_companies
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void>
  {
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_insurance_companies_updated_at ON insurance_companies;
    `);
    await queryRunner.dropTable('insurance_companies');
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column;
    `);
  }
}
