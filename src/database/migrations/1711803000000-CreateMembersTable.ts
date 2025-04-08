import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMembersTable1711803000000 implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void>
  {
    await queryRunner.createTable(
      new Table({
        name: 'members',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'username',
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
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'userType',
            type: 'varchar',  // Ensure this is a string (enum stored as string)
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lastLoginAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'policyNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'dateOfBirth',
            type: 'date',
          },
          {
            name: 'gender',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'nationalId',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'jsonb',  // Change to jsonb for structured data
            isNullable: true,
          },
          {
            name: 'dependents',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'medicalHistory',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'employerId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'coverageStartDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'coverageEndDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'benefits',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'policyContractId',
            type: 'varchar',//it was uuid
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

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER update_members_updated_at
      BEFORE UPDATE ON members
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void>
  {
    await queryRunner.query('DROP TRIGGER IF EXISTS update_members_updated_at ON members;');
    await queryRunner.dropTable('members');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_updated_at_column();');
  }
}
