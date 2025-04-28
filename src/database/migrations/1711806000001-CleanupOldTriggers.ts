import { MigrationInterface, QueryRunner } from 'typeorm';

export class CleanupOldTriggers1711806000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop all existing triggers that use the old function
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_insurance_companies_updated_at ON insurance_companies;
      DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
      DROP TRIGGER IF EXISTS update_members_updated_at ON members;
      DROP TRIGGER IF EXISTS update_policy_products_updated_at ON policy_products;
      DROP TRIGGER IF EXISTS update_policy_contracts_updated_at ON policy_contracts;
      DROP TRIGGER IF EXISTS update_medical_categories_updated_at ON medical_categories;
      DROP TRIGGER IF EXISTS update_medical_services_updated_at ON medical_services;
      DROP TRIGGER IF EXISTS update_medical_items_updated_at ON medical_items;
      DROP TRIGGER IF EXISTS update_invoice_updated_at ON invoice;
      DROP TRIGGER IF EXISTS update_invoice_items_updated_at ON invoice_items;
      DROP TRIGGER IF EXISTS update_payment_plans_updated_at ON payment_plans;
      DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
      DROP TRIGGER IF EXISTS update_claim_items_updated_at ON claim_items;
      DROP TRIGGER IF EXISTS update_claim_adjustments_updated_at ON claim_adjustments;
      DROP TRIGGER IF EXISTS update_claim_appeals_updated_at ON claim_appeals;
    `);

    // Drop the old function
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);
  }

  public async down(): Promise<void> {
    // No need to do anything in down() as this is a cleanup migration
  }
} 