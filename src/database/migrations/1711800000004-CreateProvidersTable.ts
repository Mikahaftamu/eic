import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { UserType } from '../../common/enums/user-type.enum';
import { ProviderCategory } from '../../providers/enums/provider-category.enum';
import { HealthFacilityType } from '../../providers/enums/health-facility-type.enum';

export class CreateProvidersTable1711800000004 implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void>
    {
        // First create the enum types explicitly to avoid naming conflicts
        await queryRunner.query(`
            CREATE TYPE "provider_user_type_enum" AS ENUM (
                '${UserType.ADMIN}',
                '${UserType.INSURANCE_ADMIN}',
                '${UserType.INSURANCE_STAFF}',
                '${UserType.CORPORATE_ADMIN}',
                '${UserType.PROVIDER_ADMIN}',
                '${UserType.STAFF}',
                '${UserType.MEMBER}',
                '${UserType.PROVIDER}'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "provider_category_enum" AS ENUM (
                '${ProviderCategory.HEALTH_FACILITY}',
                '${ProviderCategory.OTHER}'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "health_facility_type_enum" AS ENUM (
                '${HealthFacilityType.GENERAL_HOSPITAL}',
                '${HealthFacilityType.SPECIALIZED_HOSPITAL}',
                '${HealthFacilityType.LABORATORY}',
                '${HealthFacilityType.CLINIC}',
                '${HealthFacilityType.PRIMARY_HOSPITAL}',
                '${HealthFacilityType.PHARMACY}'
            )
        `);

        // Then create the table
        await queryRunner.createTable(
            new Table({
                name: 'providers',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
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
                        type: 'enum',
                        enumName: 'provider_user_type_enum',
                        default: `'${UserType.PROVIDER}'`,
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
                    },
                    {
                        name: 'facilityName',
                        type: 'varchar',
                    },
                    {
                        name: 'category',
                        type: 'enum',
                        enumName: 'provider_category_enum',
                        default: `'${ProviderCategory.HEALTH_FACILITY}'`,
                    },
                    {
                        name: 'facilityType',
                        type: 'enum',
                        enumName: 'health_facility_type_enum',
                        isNullable: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
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
                        name: 'licenseNumber',
                        type: 'varchar',
                    },
                    {
                        name: 'healthFacilityType',
                        type: 'enum',
                        enumName: 'health_facility_type_enum',
                    },
                    {
                        name: 'specialties',
                        type: 'text',
                        isArray: true,
                    },
                    {
                        name: 'services',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'facilityServices',
                        type: 'text',
                        isArray: true,
                    },
                    {
                        name: 'active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'licenseExpiryDate',
                        type: 'date',
                    },
                    {
                        name: 'taxId',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'location',
                        type: 'jsonb',
                    },
                    {
                        name: 'operatingHours',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'accreditations',
                        type: 'jsonb',
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
                    // New adminId column added here
                    {
                        name: 'adminId',
                        type: 'uuid',
                        isNullable: true, // Making it nullable if the relationship is optional
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['insuranceCompanyId'],
                        referencedTableName: 'insurance_companies',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                    // New foreign key for admin relationship
                    {
                        columnNames: ['adminId'],
                        referencedTableName: 'admins',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL', // Or 'CASCADE' depending on your requirements
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.dropTable('providers');
        await queryRunner.query('DROP TYPE "provider_user_type_enum"');
        await queryRunner.query('DROP TYPE "provider_category_enum"');
        await queryRunner.query('DROP TYPE "health_facility_type_enum"');
    }
}