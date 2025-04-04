// src/database/migrations/1711806000000-CreatePolicyContractsTable.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { ContractStatus } from '../../policy/enums/contract-status.enum';
import { PaymentStatus } from '../../policy/enums/payment-status.enum';
import { CancellationReason } from '../../policy/enums/cancellation-reason.enum';

export class CreatePolicyContractsTable1711806000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types first
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

    // Create policy_contracts table with proper array syntax
    await queryRunner.query(`
      CREATE TABLE policy_contracts (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "contractNumber" varchar NOT NULL UNIQUE,
        "insuranceCompanyId" uuid NOT NULL,
        "policyProductId" uuid NOT NULL,
        "primaryMemberId" uuid NOT NULL,
        "dependentMemberIds" uuid[] NOT NULL DEFAULT '{}',
        status contract_status_enum NOT NULL DEFAULT 'DRAFT',
        "paymentStatus" payment_status_enum NOT NULL DEFAULT 'PENDING',
        "effectiveDate" timestamp NOT NULL,
        "endDate" timestamp NOT NULL,
        "nextPremiumDueDate" timestamp NOT NULL,
        "premiumAmount" decimal(10,2) NOT NULL,
        "totalCoverageAmount" decimal(10,2) NOT NULL,
        "waitingPeriodEndDate" timestamp,
        "gracePeriodEndDate" timestamp,
        "cancellationReason" cancellation_reason_enum,
        "cancellationDate" timestamp,
        "previousContractId" uuid,
        "specialTerms" jsonb,
        "paymentHistory" jsonb NOT NULL DEFAULT '[]',
        documents jsonb NOT NULL DEFAULT '[]',
        "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    // Add trigger for updatedAt
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_policy_contracts_updated_at ON policy_contracts;
      CREATE TRIGGER update_policy_contracts_updated_at
        BEFORE UPDATE ON policy_contracts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger first
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_policy_contracts_updated_at ON policy_contracts;
    `);

    // Drop foreign keys
    const table = await queryRunner.getTable('policy_contracts');
    if (table) {
      const foreignKeys = table.foreignKeys;
      await queryRunner.dropForeignKeys('policy_contracts', foreignKeys);
    }

    // Drop table
    await queryRunner.dropTable('policy_contracts');

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE IF EXISTS contract_status_enum;
      DROP TYPE IF EXISTS payment_status_enum;
      DROP TYPE IF EXISTS cancellation_reason_enum;
    `);

    // Drop function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);
  }
}