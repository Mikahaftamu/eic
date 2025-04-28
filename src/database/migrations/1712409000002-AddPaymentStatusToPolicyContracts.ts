import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentStatusToPolicyContracts1712409000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First check if the payment_status_enum exists
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum'
      );
    `);

    if (!enumExists[0].exists) {
      // Create the enum type if it doesn't exist
      await queryRunner.query(`
        CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
      `);
    }

    // Check if the column exists
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'policy_contracts' 
        AND column_name = 'paymentStatus'
      );
    `);

    if (!columnExists[0].exists) {
      // Add the column if it doesn't exist
      await queryRunner.query(`
        ALTER TABLE policy_contracts
        ADD COLUMN "paymentStatus" payment_status_enum NOT NULL DEFAULT 'PENDING';
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the column
    await queryRunner.query(`
      ALTER TABLE policy_contracts
      DROP COLUMN IF EXISTS "paymentStatus";
    `);

    // Drop the enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS payment_status_enum;
    `);
  }
} 