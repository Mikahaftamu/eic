import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { InvoiceStatus, InvoiceType } from '../../billing/entities/invoice.entity';
import { PaymentPlanStatus, PaymentFrequency } from '../../billing/entities/payment-plan.entity';

export class CreateBillingTables1711806000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE invoice_status_enum AS ENUM (${Object.values(InvoiceStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE invoice_type_enum AS ENUM (${Object.values(InvoiceType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE payment_plan_status_enum AS ENUM (${Object.values(PaymentPlanStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE payment_frequency_enum AS ENUM (${Object.values(PaymentFrequency).map(freq => `'${freq}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create invoice table
    await queryRunner.createTable(
      new Table({
        name: 'invoice',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'invoiceNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'invoice_status_enum',
            default: "'draft'",
          },
          {
            name: 'type',
            type: 'enum',
            enumName: 'invoice_type_enum',
            default: "'premium'",
          },
          {
            name: 'issueDate',
            type: 'date',
          },
          {
            name: 'dueDate',
            type: 'date',
          },
          {
            name: 'paidDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'subtotal',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'tax',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'discount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'amountPaid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'amountDue',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'taxAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'discountAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'paymentTerms',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'billingAddress',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
          },
          {
            name: 'memberId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'corporateClientId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'policyContractId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reminderSent',
            type: 'boolean',
            default: false,
          },
          {
            name: 'lastReminderDate',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'reminderCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'isRecurring',
            type: 'boolean',
            default: false,
          },
          {
            name: 'recurringFrequency',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'nextRecurringDate',
            type: 'timestamp',
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

    // Create invoice_items table
    await queryRunner.createTable(
      new Table({
        name: 'invoice_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'invoiceId',
            type: 'uuid',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
          },
          {
            name: 'discount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'tax',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'total',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'serviceDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'serviceCode',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'periodStart',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'periodEnd',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'itemType',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
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

    // Create payment_plans table
    await queryRunner.createTable(
      new Table({
        name: 'payment_plans',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'planNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'invoiceId',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'payment_plan_status_enum',
            default: "'active'",
          },
          {
            name: 'frequency',
            type: 'enum',
            enumName: 'payment_frequency_enum',
            default: "'monthly'",
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'amountPaid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'installmentAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'totalInstallments',
            type: 'int',
          },
          {
            name: 'installmentsPaid',
            type: 'int',
            default: 0,
          },
          {
            name: 'startDate',
            type: 'date',
          },
          {
            name: 'endDate',
            type: 'date',
          },
          {
            name: 'nextDueDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'gracePeriodDays',
            type: 'int',
            default: 0,
          },
          {
            name: 'autoDebit',
            type: 'boolean',
            default: false,
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'paymentDetails',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
          },
          {
            name: 'memberId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'corporateClientId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'reminderEnabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'reminderDaysBefore',
            type: 'int',
            default: 3,
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
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "invoice" ADD CONSTRAINT "FK_156ffd85ea735b1d3296629153d" 
        FOREIGN KEY ("insuranceCompanyId") REFERENCES "insurance_companies"("id") ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_member" 
        FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_corporate_client" 
        FOREIGN KEY ("corporateClientId") REFERENCES "corporate_client"("id") ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        ALTER TABLE "invoice" ADD CONSTRAINT "FK_invoice_policy_contract" 
        FOREIGN KEY ("policyContractId") REFERENCES "policy_contracts"("id") ON DELETE SET NULL;
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.createForeignKeys('invoice_items', [
      new TableForeignKey({
        columnNames: ['invoiceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'invoice',
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createForeignKeys('payment_plans', [
      new TableForeignKey({
        columnNames: ['invoiceId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'invoice',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['insuranceCompanyId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'insurance_companies',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['memberId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'members',
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['corporateClientId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'corporate_client',
        onDelete: 'SET NULL',
      }),
    ]);

    // Add triggers for updatedAt
    await queryRunner.query(`
      CREATE TRIGGER update_invoice_updated_at
        BEFORE UPDATE ON invoice
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_invoice_items_updated_at
        BEFORE UPDATE ON invoice_items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_payment_plans_updated_at
        BEFORE UPDATE ON payment_plans
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers first
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_invoice_updated_at ON invoice;
      DROP TRIGGER IF EXISTS update_invoice_items_updated_at ON invoice_items;
      DROP TRIGGER IF EXISTS update_payment_plans_updated_at ON payment_plans;
    `);

    // Drop foreign keys
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_insuranceCompanyId');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_memberId');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_corporateClientId');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_policyContractId');
    await queryRunner.dropForeignKey('invoice_items', 'FK_invoice_items_invoiceId');
    await queryRunner.dropForeignKey('payment_plans', 'FK_payment_plans_invoiceId');
    await queryRunner.dropForeignKey('payment_plans', 'FK_payment_plans_insuranceCompanyId');
    await queryRunner.dropForeignKey('payment_plans', 'FK_payment_plans_memberId');
    await queryRunner.dropForeignKey('payment_plans', 'FK_payment_plans_corporateClientId');

    // Drop tables
    await queryRunner.dropTable('payment_plans');
    await queryRunner.dropTable('invoice_items');
    await queryRunner.dropTable('invoice');

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE IF EXISTS invoice_status_enum;
      DROP TYPE IF EXISTS invoice_type_enum;
      DROP TYPE IF EXISTS payment_plan_status_enum;
      DROP TYPE IF EXISTS payment_frequency_enum;
    `);
  }
} 