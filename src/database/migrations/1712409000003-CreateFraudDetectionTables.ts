import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFraudDetectionTables1712409000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE rule_type_enum AS ENUM (
          'FREQUENCY', 'COMPATIBILITY', 'UPCODING', 'PHANTOM_BILLING', 
          'DUPLICATE', 'UNBUNDLING', 'MEDICAL_NECESSITY', 'PROVIDER_SPECIALTY', 
          'MEMBER_ELIGIBILITY', 'GEOGRAPHIC', 'CUSTOM'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE rule_severity_enum AS ENUM (
          'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE rule_status_enum AS ENUM (
          'ACTIVE', 'INACTIVE', 'TESTING'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE alert_status_enum AS ENUM (
          'NEW', 'UNDER_REVIEW', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE alert_resolution_enum AS ENUM (
          'NONE', 'FRAUD_CONFIRMED', 'FALSE_POSITIVE', 'INVESTIGATION_COMPLETED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create fraud_rules table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fraud_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        type rule_type_enum NOT NULL,
        severity rule_severity_enum NOT NULL DEFAULT 'MEDIUM',
        status rule_status_enum NOT NULL DEFAULT 'ACTIVE',
        configuration JSONB NOT NULL,
        "insuranceCompanyId" UUID,
        "isSystemWide" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create claim_fraud_alerts table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS claim_fraud_alerts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "claimId" UUID NOT NULL,
        "ruleId" UUID NOT NULL,
        severity rule_severity_enum NOT NULL,
        status alert_status_enum NOT NULL DEFAULT 'NEW',
        resolution alert_resolution_enum NOT NULL DEFAULT 'NONE',
        explanation TEXT NOT NULL,
        "confidenceScore" INTEGER NOT NULL,
        "additionalData" JSONB,
        "reviewedByUserId" UUID,
        "reviewedAt" TIMESTAMP,
        "reviewNotes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("ruleId") REFERENCES fraud_rules(id) ON DELETE CASCADE
      )
    `);

    // Add indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_fraud_rules_insurance_company 
      ON fraud_rules("insuranceCompanyId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_fraud_rules_code 
      ON fraud_rules(code)
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_claim_fraud_alerts_claim 
      ON claim_fraud_alerts("claimId")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_claim_fraud_alerts_rule 
      ON claim_fraud_alerts("ruleId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS claim_fraud_alerts`);
    await queryRunner.query(`DROP TABLE IF EXISTS fraud_rules`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS alert_resolution_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS alert_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS rule_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS rule_severity_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS rule_type_enum`);
  }
} 