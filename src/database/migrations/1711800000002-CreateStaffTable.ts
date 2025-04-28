import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { UserType } from '../../common/enums/user-type.enum';
import { StaffRole } from '../../staff/entities/staff.entity';

export class CreateStaffTable1711800000002 implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.createTable(
            new Table({
                name: 'staff',
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
                        enum: Object.values(UserType),
                        default: `'${UserType.STAFF}'`,
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
                        isNullable: true,
                    },
                    {
                        name: 'roles',
                        type: 'enum',
                        enum: Object.values(StaffRole),
                        isArray: true, // Set isarray: true,
                        default: `'{${StaffRole.GENERAL_STAFF}}'`,
                    },
                    {
                        name: 'department',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'position',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'employeeId',
                        type: 'varchar',
                    },
                    {
                        name: 'permissions',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'supervisorId',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'workAssignments',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'performance',
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
                ],
                foreignKeys: [
                    {
                        columnNames: ['insuranceCompanyId'],
                        referencedTableName: 'insurance_companies',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.dropTable('staff');
    }
}