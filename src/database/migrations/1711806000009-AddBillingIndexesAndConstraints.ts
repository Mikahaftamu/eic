import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingIndexesAndConstraints1711806000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add indexes for frequently queried fields
    await queryRunner.query(`
      -- Invoice table indexes
      CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoice(status);
      CREATE INDEX IF NOT EXISTS idx_invoice_due_date ON invoice("dueDate");
      CREATE INDEX IF NOT EXISTS idx_invoice_insurance_company ON invoice("insuranceCompanyId");
      CREATE INDEX IF NOT EXISTS idx_invoice_member ON invoice("memberId");
      CREATE INDEX IF NOT EXISTS idx_invoice_corporate_client ON invoice("corporateClientId");
      CREATE INDEX IF NOT EXISTS idx_invoice_policy_contract ON invoice("policyContractId");

      -- Invoice items indexes
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items("invoiceId");
      CREATE INDEX IF NOT EXISTS idx_invoice_items_service_date ON invoice_items("serviceDate");
      CREATE INDEX IF NOT EXISTS idx_invoice_items_service_code ON invoice_items("serviceCode");

      -- Payment plans indexes
      CREATE INDEX IF NOT EXISTS idx_payment_plans_status ON payment_plans(status);
      CREATE INDEX IF NOT EXISTS idx_payment_plans_next_due_date ON payment_plans("nextDueDate");
      CREATE INDEX IF NOT EXISTS idx_payment_plans_insurance_company ON payment_plans("insuranceCompanyId");
      CREATE INDEX IF NOT EXISTS idx_payment_plans_member ON payment_plans("memberId");
      CREATE INDEX IF NOT EXISTS idx_payment_plans_corporate_client ON payment_plans("corporateClientId");
    `);

    // Add validation constraints
    await queryRunner.query(`
      -- Amount validations
      ALTER TABLE invoice
        ADD CONSTRAINT chk_invoice_amounts_non_negative 
        CHECK (
          subtotal >= 0 AND
          tax >= 0 AND
          discount >= 0 AND
          total >= 0 AND
          "amountPaid" >= 0 AND
          "amountDue" >= 0 AND
          "taxAmount" >= 0 AND
          "discountAmount" >= 0
        );

      ALTER TABLE invoice_items
        ADD CONSTRAINT chk_invoice_items_amounts_non_negative 
        CHECK (
          "unitPrice" >= 0 AND
          quantity >= 0 AND
          discount >= 0 AND
          tax >= 0 AND
          total >= 0
        );

      ALTER TABLE payment_plans
        ADD CONSTRAINT chk_payment_plan_amounts_non_negative 
        CHECK (
          "totalAmount" >= 0 AND
          "amountPaid" >= 0 AND
          "installmentAmount" >= 0 AND
          "totalInstallments" >= 0 AND
          "installmentsPaid" >= 0
        );

      -- Date validations
      ALTER TABLE invoice
        ADD CONSTRAINT chk_invoice_dates_valid 
        CHECK (
          "dueDate" >= "issueDate" AND
          ("paidDate" IS NULL OR "paidDate" >= "issueDate")
        );

      ALTER TABLE payment_plans
        ADD CONSTRAINT chk_payment_plan_dates_valid 
        CHECK (
          "endDate" > "startDate" AND
          ("nextDueDate" IS NULL OR "nextDueDate" >= "startDate")
        );

      -- Status transition validations
      ALTER TABLE invoice
        ADD CONSTRAINT chk_invoice_status_transition 
        CHECK (
          (status = 'draft' AND "amountPaid" = 0) OR
          (status = 'pending' AND "amountPaid" = 0) OR
          (status = 'paid' AND "amountPaid" = total) OR
          (status = 'partially_paid' AND "amountPaid" > 0 AND "amountPaid" < total) OR
          (status = 'overdue' AND "amountPaid" < total) OR
          (status = 'cancelled' AND "amountPaid" = 0)
        );

      ALTER TABLE payment_plans
        ADD CONSTRAINT chk_payment_plan_status_transition 
        CHECK (
          (status = 'active' AND "amountPaid" < "totalAmount") OR
          (status = 'completed' AND "amountPaid" = "totalAmount") OR
          (status = 'cancelled' AND "amountPaid" = 0) OR
          (status = 'defaulted' AND "amountPaid" < "totalAmount")
        );

      -- Payment plan installment validations
      ALTER TABLE payment_plans
        ADD CONSTRAINT chk_payment_plan_installments_valid 
        CHECK (
          "installmentsPaid" <= "totalInstallments" AND
          "amountPaid" <= "totalAmount" AND
          ("installmentAmount" * "totalInstallments") = "totalAmount"
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      -- Drop invoice indexes
      DROP INDEX IF EXISTS idx_invoice_status;
      DROP INDEX IF EXISTS idx_invoice_due_date;
      DROP INDEX IF EXISTS idx_invoice_insurance_company;
      DROP INDEX IF EXISTS idx_invoice_member;
      DROP INDEX IF EXISTS idx_invoice_corporate_client;
      DROP INDEX IF EXISTS idx_invoice_policy_contract;

      -- Drop invoice items indexes
      DROP INDEX IF EXISTS idx_invoice_items_invoice;
      DROP INDEX IF EXISTS idx_invoice_items_service_date;
      DROP INDEX IF EXISTS idx_invoice_items_service_code;

      -- Drop payment plans indexes
      DROP INDEX IF EXISTS idx_payment_plans_status;
      DROP INDEX IF EXISTS idx_payment_plans_next_due_date;
      DROP INDEX IF EXISTS idx_payment_plans_insurance_company;
      DROP INDEX IF EXISTS idx_payment_plans_member;
      DROP INDEX IF EXISTS idx_payment_plans_corporate_client;
    `);

    // Drop constraints
    await queryRunner.query(`
      -- Drop invoice constraints
      ALTER TABLE invoice
        DROP CONSTRAINT IF EXISTS chk_invoice_amounts_non_negative,
        DROP CONSTRAINT IF EXISTS chk_invoice_dates_valid,
        DROP CONSTRAINT IF EXISTS chk_invoice_status_transition;

      -- Drop invoice items constraints
      ALTER TABLE invoice_items
        DROP CONSTRAINT IF EXISTS chk_invoice_items_amounts_non_negative;

      -- Drop payment plans constraints
      ALTER TABLE payment_plans
        DROP CONSTRAINT IF EXISTS chk_payment_plan_amounts_non_negative,
        DROP CONSTRAINT IF EXISTS chk_payment_plan_dates_valid,
        DROP CONSTRAINT IF EXISTS chk_payment_plan_status_transition,
        DROP CONSTRAINT IF EXISTS chk_payment_plan_installments_valid;
    `);
  }
} 