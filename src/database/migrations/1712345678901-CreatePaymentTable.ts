// src/migrations/[timestamp]-CreatePaymentTable.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { PaymentStatus } from '../../billing/entities/payment.entity';
import { PaymentMethod } from '../../billing/entities/payment.entity';
import { PaymentType } from '../../billing/entities/payment.entity';

export class CreatePaymentTable1712345678901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
          CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
        END IF;
      END$$;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
          CREATE TYPE payment_method_enum AS ENUM (
            'credit_card', 'debit_card', 'bank_transfer', 'cash',
            'check', 'mobile_money', 'digital_wallet'
          );
        END IF;
      END$$;

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type_enum') THEN
          CREATE TYPE payment_type_enum AS ENUM ('premium', 'claim', 'refund', 'fee', 'other');
        END IF;
      END$$;
    `);

    // Create payment table
    await queryRunner.createTable(new Table({
      name: 'payment',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()'
        },
        {
          name: 'transactionId',
          type: 'varchar',
          isUnique: true,
          isNullable: false
        },
        {
          name: 'invoiceId',
          type: 'uuid',
          isNullable: false
        },
        {
          name: 'amount',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: false
        },
        {
          name: 'status',
          type: 'enum',
          enum: Object.values(PaymentStatus),
          enumName: 'payment_status_enum',
          default: `'${PaymentStatus.PENDING}'`,
          isNullable: false
        },
        {
          name: 'method',
          type: 'enum',
          enum: Object.values(PaymentMethod),
          enumName: 'payment_method_enum',
          default: `'${PaymentMethod.BANK_TRANSFER}'`,
          isNullable: false
        },
        {
          name: 'type',
          type: 'enum',
          enum: Object.values(PaymentType),
          enumName: 'payment_type_enum',
          default: `'${PaymentType.OTHER}'`,
          isNullable: false
        },
        {
          name: 'paymentDate',
          type: 'date',
          isNullable: false
        },
        {
          name: 'paymentReference',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'paymentGateway',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'gatewayTransactionId',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'gatewayResponse',
          type: 'text',
          isNullable: true
        },
        {
          name: 'notes',
          type: 'text',
          isNullable: true
        },
        {
          name: 'insuranceCompanyId',
          type: 'uuid',
          isNullable: false
        },
        {
          name: 'memberId',
          type: 'uuid',
          isNullable: true
        },
        {
          name: 'corporateClientId',
          type: 'uuid',
          isNullable: true
        },
        {
          name: 'payerName',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'payerEmail',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'payerPhone',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'cardLastFour',
          type: 'varchar',
          length: '4',
          isNullable: true
        },
        {
          name: 'cardType',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'receiptSent',
          type: 'boolean',
          isNullable: true
        },
        {
          name: 'receiptEmail',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'refundDate',
          type: 'timestamp',
          isNullable: true
        },
        {
          name: 'createdAt',
          type: 'timestamp',
          default: 'now()',
          isNullable: false
        },
        {
          name: 'updatedAt',
          type: 'timestamp',
          default: 'now()',
          isNullable: false
        }
      ]
    }), true);

    // Create foreign keys
    await queryRunner.createForeignKey('payment', new TableForeignKey({
      columnNames: ['invoiceId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'invoice',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }));

    await queryRunner.createForeignKey('payment', new TableForeignKey({
      columnNames: ['insuranceCompanyId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'insurance_companies',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    }));

    // Add indexes for frequently queried fields
    await queryRunner.query(`
      -- Payment table indexes
      CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
      CREATE INDEX IF NOT EXISTS idx_payment_transaction_id ON payment("transactionId");
      CREATE INDEX IF NOT EXISTS idx_payment_invoice ON payment("invoiceId");
      CREATE INDEX IF NOT EXISTS idx_payment_payment_date ON payment("paymentDate");
      CREATE INDEX IF NOT EXISTS idx_payment_insurance_company ON payment("insuranceCompanyId");
      CREATE INDEX IF NOT EXISTS idx_payment_member ON payment("memberId");
      CREATE INDEX IF NOT EXISTS idx_payment_corporate_client ON payment("corporateClientId");
    `);

    // Add validation constraints
    await queryRunner.query(`
      -- Amount validations
      ALTER TABLE payment
        ADD CONSTRAINT chk_payment_amount_non_negative 
        CHECK (amount >= 0);

      -- Date validations
      ALTER TABLE payment
        ADD CONSTRAINT chk_payment_dates_valid 
        CHECK (
          "paymentDate" IS NOT NULL AND
          ("refundDate" IS NULL OR "refundDate" >= "paymentDate")
        );

      -- Status transition validations
      ALTER TABLE payment
        ADD CONSTRAINT chk_payment_status_transition 
        CHECK (
          (status::text = 'PENDING' AND "refundDate" IS NULL) OR
          (status::text = 'COMPLETED' AND "refundDate" IS NULL) OR
          (status::text = 'FAILED' AND "refundDate" IS NULL) OR
          (status::text = 'REFUNDED' AND "refundDate" IS NOT NULL)
        );

      -- Payment method validations
      ALTER TABLE payment
        ADD CONSTRAINT chk_payment_method_details 
        CHECK (
          (method::text = 'credit_card' AND "cardLastFour" IS NOT NULL AND "cardType" IS NOT NULL) OR
          (method::text = 'debit_card' AND "cardLastFour" IS NOT NULL AND "cardType" IS NOT NULL) OR
          (method::text IN ('bank_transfer', 'mobile_money', 'digital_wallet') AND "paymentReference" IS NOT NULL) OR
          (method::text IN ('cash', 'check') AND "paymentReference" IS NULL)
        );
    `);

    // Add trigger for auto-updating updatedAt
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_payment_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER payment_updated_at_trigger
      BEFORE UPDATE ON payment
      FOR EACH ROW
      EXECUTE FUNCTION update_payment_updated_at();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS payment_updated_at_trigger ON payment;
      DROP FUNCTION IF EXISTS update_payment_updated_at();
    `);

    // Drop constraints
    await queryRunner.query(`
      ALTER TABLE payment
        DROP CONSTRAINT IF EXISTS chk_payment_amount_non_negative,
        DROP CONSTRAINT IF EXISTS chk_payment_dates_valid,
        DROP CONSTRAINT IF EXISTS chk_payment_status_transition,
        DROP CONSTRAINT IF EXISTS chk_payment_method_details;
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_payment_status;
      DROP INDEX IF EXISTS idx_payment_transaction_id;
      DROP INDEX IF EXISTS idx_payment_invoice;
      DROP INDEX IF EXISTS idx_payment_payment_date;
      DROP INDEX IF EXISTS idx_payment_insurance_company;
      DROP INDEX IF EXISTS idx_payment_member;
      DROP INDEX IF EXISTS idx_payment_corporate_client;
    `);

    // Drop foreign keys
    await queryRunner.dropForeignKey('payment', 'FK_payment_invoiceId');
    await queryRunner.dropForeignKey('payment', 'FK_payment_insuranceCompanyId');

    // Drop table
    await queryRunner.dropTable('payment');

    // Drop enum types
    await queryRunner.query('DROP TYPE IF EXISTS payment_status_enum');
    await queryRunner.query('DROP TYPE IF EXISTS payment_method_enum');
    await queryRunner.query('DROP TYPE IF EXISTS payment_type_enum');
  }
}