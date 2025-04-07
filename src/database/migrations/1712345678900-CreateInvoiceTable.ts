// src/migrations/[timestamp]-CreateInvoiceTable.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInvoiceTable1712345678900 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE invoice_status_enum AS ENUM (
        'draft', 'pending', 'paid', 'partially_paid', 
        'unpaid', 'overdue', 'cancelled', 'void'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE invoice_type_enum AS ENUM (
        'premium', 'claim', 'refund', 'fee', 'other'
      )
    `);

    // Create invoice table
    await queryRunner.createTable(new Table({
      name: 'invoice',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()'
        },
        {
          name: 'invoiceNumber',
          type: 'varchar',
          isUnique: true,
          isNullable: false
        },
        {
          name: 'status',
          type: 'enum',
          enum: ['draft', 'pending', 'paid', 'partially_paid', 'unpaid', 'overdue', 'cancelled', 'void'],
          enumName: 'invoice_status_enum',
          default: "'draft'",
          isNullable: false
        },
        {
          name: 'type',
          type: 'enum',
          enum: ['premium', 'claim', 'refund', 'fee', 'other'],
          enumName: 'invoice_type_enum',
          default: "'premium'",
          isNullable: false
        },
        {
          name: 'issueDate',
          type: 'date',
          isNullable: false
        },
        {
          name: 'dueDate',
          type: 'date',
          isNullable: false
        },
        {
          name: 'paidDate',
          type: 'timestamp',
          isNullable: true
        },
        {
          name: 'subtotal',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: false
        },
        {
          name: 'tax',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false
        },
        {
          name: 'discount',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false
        },
        {
          name: 'total',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: false
        },
        {
          name: 'amountPaid',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false
        },
        {
          name: 'amountDue',
          type: 'decimal',
          precision: 10,
          scale: 2,
          isNullable: false
        },
        {
          name: 'taxAmount',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false
        },
        {
          name: 'discountAmount',
          type: 'decimal',
          precision: 10,
          scale: 2,
          default: 0,
          isNullable: false
        },
        {
          name: 'notes',
          type: 'text',
          isNullable: true
        },
        {
          name: 'paymentTerms',
          type: 'text',
          isNullable: true
        },
        {
          name: 'billingAddress',
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
          name: 'policyContractId',
          type: 'uuid',
          isNullable: true
        },
        {
          name: 'reminderSent',
          type: 'boolean',
          default: false,
          isNullable: false
        },
        {
          name: 'lastReminderDate',
          type: 'timestamp',
          isNullable: true
        },
        {
          name: 'reminderCount',
          type: 'integer',
          default: 0,
          isNullable: false
        },
        {
          name: 'isRecurring',
          type: 'boolean',
          default: false,
          isNullable: false
        },
        {
          name: 'recurringFrequency',
          type: 'varchar',
          isNullable: true
        },
        {
          name: 'nextRecurringDate',
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
    await queryRunner.createForeignKey('invoice', new TableForeignKey({
      columnNames: ['insuranceCompanyId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'insurance_companies',
      onDelete: 'CASCADE'
    }));
/*
    await queryRunner.createForeignKey('invoice', new TableForeignKey({
      columnNames: ['memberId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'member',
      onDelete: 'SET NULL'
    }));

    await queryRunner.createForeignKey('invoice', new TableForeignKey({
      columnNames: ['corporateClientId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'corporate_client',
      onDelete: 'SET NULL'
    }));
    

    await queryRunner.createForeignKey('invoice', new TableForeignKey({
      columnNames: ['policyContractId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'policy_contract',
      onDelete: 'SET NULL'
    }));
*/
    // Create trigger for auto-updating updatedAt
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_invoice_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER invoice_updated_at_trigger
      BEFORE UPDATE ON invoice
      FOR EACH ROW
      EXECUTE FUNCTION update_invoice_updated_at();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS invoice_updated_at_trigger ON invoice;
      DROP FUNCTION IF EXISTS update_invoice_updated_at();
    `);

    // Drop foreign keys
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_insuranceCompanyId');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_memberId');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_corporateClientId');
    await queryRunner.dropForeignKey('invoice', 'FK_invoice_policyContractId');

    // Drop table
    await queryRunner.dropTable('invoice');

    // Drop enum types
    await queryRunner.query('DROP TYPE IF EXISTS invoice_status_enum');
    await queryRunner.query('DROP TYPE IF EXISTS invoice_type_enum');
  }
}