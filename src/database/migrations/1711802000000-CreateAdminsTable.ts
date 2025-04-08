import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { UserType } from '../../common/enums/user-type.enum';
import { AdminType } from '../../common/enums/admin-type.enum';

export class CreateAdminsTable1711802000000 implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void>
  {
    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE "user_type_enum" AS ENUM(${Object.values(UserType).map(val => `'${val}'`).join(',')})
    `);
    await queryRunner.query(`
      CREATE TYPE "admin_type_enum" AS ENUM(${Object.values(AdminType).map(val => `'${val}'`).join(',')})
    `);

    // Create admins table
    await queryRunner.createTable(
      new Table({
        name: 'admins',
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
            type: 'user_type_enum',
            default: `'${UserType.ADMIN}'`,
          },
          {
            name: 'firstName',
            type: 'varchar',
          },
          {
            name: 'lastName',
            type: 'varchar',
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: true,
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
            name: 'adminType',
            type: 'admin_type_enum',
            default: `'${AdminType.SYSTEM_ADMIN}'`,
          },
          {
            name: 'corporateClientId',
            type: 'uuid',
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
        foreignKeys: [
          {
            columnNames: ['insuranceCompanyId'],
            referencedTableName: 'insurance_companies',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['corporateClientId'],
            referencedTableName: 'corporate_clients',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      })
    );

    // Trigger to auto-update updatedAt
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER update_admins_updated_at
      BEFORE UPDATE ON admins
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void>
  {
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_admins_updated_at ON admins`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);
    await queryRunner.dropTable('admins');
    await queryRunner.query(`DROP TYPE IF EXISTS "user_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "admin_type_enum"`);
  }
}
