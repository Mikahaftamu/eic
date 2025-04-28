import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCorporateClientTable1711800000001 implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.createTable(
            new Table({
                name: 'corporate_client',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'registrationNumber',
                        type: 'varchar',
                        isUnique: true,
                    },
                    {
                        name: 'address',
                        type: 'varchar',
                    },
                    {
                        name: 'phone',
                        type: 'varchar',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'website',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'contactPerson',
                        type: 'jsonb',
                    },
                    {
                        name: 'insuranceCompanyId',
                        type: 'uuid',
                    },
                    {
                        name: 'contractDetails',
                        type: 'jsonb',
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
                foreignKeys: [
                    {
                        columnNames: ['insuranceCompanyId'],
                        referencedTableName: 'insurance_companies',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void>
    {
        await queryRunner.dropTable('corporate_client');
    }
}