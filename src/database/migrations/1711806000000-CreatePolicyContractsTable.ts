import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { ContractStatus } from '../../policy/enums/contract-status.enum';
import { PaymentStatus } from '../../policy/enums/payment-status.enum';
import { CancellationReason } from '../../policy/enums/cancellation-reason.enum';

export class CreatePolicyContractsTable1711806000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE contract_status_enum AS ENUM (${Object.values(ContractStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE payment_status_enum AS ENUM (${Object.values(PaymentStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE cancellation_reason_enum AS ENUM (${Object.values(CancellationReason).map(reason => `'${reason}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create policy_contracts table
    await queryRunner.createTable(
      new Table({
        name: 'policy_contracts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'contractNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
          },
          {
            name: 'policyProductId',
            type: 'uuid',
          },
          {
            name: 'primaryMemberId',
            type: 'uuid',
          },
          {
            name: 'dependentMemberIds',
            type: 'uuid',
            isArray: true,
            default: '{}',
          },
          {
            name: 'status',
            type: 'contract_status_enum',
            default: "'DRAFT'",
          },
          {
            name: 'paymentStatus',
            type: 'payment_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'effectiveDate',
            type: 'timestamp',
          },
          {
            name: 'endDate',
            type: 'timestamp',
          },
          {
            name: 'nextPremiumDueDate',
            type: 'timestamp',
          },
          {
            name: 'premiumAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'totalCoverageAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'waitingPeriodEndDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'gracePeriodEndDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'cancellationReason',
            type: 'cancellation_reason_enum',
            isNullable: true,
          },
          {
            name: 'cancellationDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'previousContractId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'specialTerms',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'paymentHistory',
            type: 'jsonb',
            default: '[]',
          },
          {
            name: 'documents',
            type: 'jsonb',
            default: '[]',
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

    // Add foreign keys
    await queryRunner.createForeignKeys('policy_contracts', [
      new TableForeignKey({
        columnNames: ['insuranceCompanyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'insurance_companies',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['policyProductId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'policy_products',
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['primaryMemberId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'members',
        onDelete: 'RESTRICT',
      }),
      new TableForeignKey({
        columnNames: ['previousContractId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'policy_contracts',
        onDelete: 'SET NULL',
      }),
    ]);

    // Add triggers for updatedAt
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_policy_contracts_updated_at ON policy_contracts;
      CREATE TRIGGER update_policy_contracts_updated_at
        BEFORE UPDATE ON policy_contracts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_policy_contracts_updated_at ON policy_contracts;`);
    await queryRunner.dropTable('policy_contracts');
    await queryRunner.query(`
      DROP TYPE IF EXISTS contract_status_enum;
      DROP TYPE IF EXISTS payment_status_enum;
      DROP TYPE IF EXISTS cancellation_reason_enum;
    `);
  }
}
