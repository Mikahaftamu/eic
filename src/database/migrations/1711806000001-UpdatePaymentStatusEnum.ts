import { MigrationInterface, QueryRunner } from 'typeorm';
import { PaymentStatus } from '../../billing/entities/payment.entity';

export class UpdatePaymentStatusEnum1711806000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the new enum type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE payment_status_enum_new AS ENUM (${Object.values(PaymentStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Update the payment table to use the new enum type
    await queryRunner.query(`
      ALTER TABLE payment 
      ALTER COLUMN status TYPE payment_status_enum_new 
      USING status::text::payment_status_enum_new;
    `);

    // Drop the old enum type
    await queryRunner.query(`
      DROP TYPE IF EXISTS payment_status_enum_old;
    `);

    // Rename the new enum type to the original name
    await queryRunner.query(`
      ALTER TYPE payment_status_enum_new RENAME TO payment_status_enum;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This is a one-way migration as we're consolidating enum values
    // If needed, you would need to handle data conversion here
    await queryRunner.query(`
      -- Cannot easily revert this change as it involves data conversion
      -- Consider backing up data before applying this migration
    `);
  }
} 