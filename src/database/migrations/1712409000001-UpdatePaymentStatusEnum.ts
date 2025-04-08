import { MigrationInterface, QueryRunner } from 'typeorm';
import { PaymentStatus } from '../../billing/entities/payment.entity';

export class UpdatePaymentStatusEnum1712409000001 implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void>
  {
    // Start transaction
    await queryRunner.startTransaction();

    try
    {
      // 1. First check if the payment table exists
      const tableExists = await queryRunner.hasTable('payment');
      if (!tableExists)
      {
        console.warn('Payment table does not exist - skipping enum update');
        await queryRunner.commitTransaction();
        return;
      }

      // 2. Check if old enum type already exists and drop it if needed
      const oldEnumExists = await queryRunner.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum_old'
        )
      `);

      if (oldEnumExists[0].exists)
      {
        console.log('Found existing payment_status_enum_old - dropping it first');
        await queryRunner.query(`
          DROP TYPE IF EXISTS payment_status_enum_old CASCADE
        `);
      }

      // 3. Create the new enum type (with more robust error handling)
      await queryRunner.query(`
        DO $$ 
        BEGIN
          CREATE TYPE payment_status_enum_new AS ENUM (${Object.values(PaymentStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN 
          RAISE NOTICE 'payment_status_enum_new already exists';
        END $$;
      `);

      // 4. Remove default constraint from payment table
      await queryRunner.query(`
        ALTER TABLE payment 
        ALTER COLUMN status DROP DEFAULT;
      `);

      // 5. Convert payment.status to text first
      await queryRunner.query(`
        ALTER TABLE payment 
        ALTER COLUMN status TYPE TEXT;
      `);

      // 6. Convert to new enum type
      await queryRunner.query(`
        ALTER TABLE payment 
        ALTER COLUMN status TYPE payment_status_enum_new 
        USING status::text::payment_status_enum_new;
      `);

      // 7. Set new default value
      await queryRunner.query(`
        ALTER TABLE payment 
        ALTER COLUMN status SET DEFAULT '${PaymentStatus.PENDING}';
      `);

      // 8. Handle dependent tables with more robust checks
      try
      {
        const hasPolicyContracts = await queryRunner.hasTable('policy_contracts');
        if (hasPolicyContracts && await queryRunner.hasColumn('policy_contracts', 'paymentStatus'))
        {
          // Check if column is using the enum type
          const columnInfo = await queryRunner.query(`
            SELECT udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'policy_contracts' 
            AND column_name = 'paymentStatus'
          `);

          if (columnInfo[0]?.udt_name === 'payment_status_enum')
          {
            // Remove default constraint first
            await queryRunner.query(`
              ALTER TABLE policy_contracts 
              ALTER COLUMN "paymentStatus" DROP DEFAULT;
            `);

            // Convert to text
            await queryRunner.query(`
              ALTER TABLE policy_contracts 
              ALTER COLUMN "paymentStatus" TYPE TEXT;
            `);

            // Convert to new enum type
            await queryRunner.query(`
              ALTER TABLE policy_contracts 
              ALTER COLUMN "paymentStatus" TYPE payment_status_enum_new 
              USING "paymentStatus"::text::payment_status_enum_new;
            `);

            // Restore default if needed
            await queryRunner.query(`
              ALTER TABLE policy_contracts 
              ALTER COLUMN "paymentStatus" SET DEFAULT '${PaymentStatus.PENDING}';
            `);
          }
        }
      } catch (err)
      {
        console.warn('Could not update policy_contracts.paymentStatus:', err.message);
      }

      // 9. Rename types with existence checks
      await queryRunner.query(`
        DO $$ 
        BEGIN
          ALTER TYPE payment_status_enum RENAME TO payment_status_enum_old;
        EXCEPTION WHEN undefined_object THEN
          RAISE NOTICE 'payment_status_enum does not exist';
        END $$;
      `);

      await queryRunner.query(`
        ALTER TYPE payment_status_enum_new RENAME TO payment_status_enum;
      `);

      // Commit transaction
      await queryRunner.commitTransaction();
      console.log('Migration completed successfully. Old enum preserved as payment_status_enum_old');

    } catch (err)
    {
      // Rollback on any error
      await queryRunner.rollbackTransaction();
      console.error('Migration failed:', err.message);
      throw err;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void>
  {
    console.warn(`
      WARNING: This migration cannot be safely reverted automatically.
      To revert, you would need to:
      1. Manually recreate the original enum type
      2. Convert all columns back to the original type
      3. Handle any data conversion issues
      Recommended approach: Restore from backup if needed.
    `);
  }
}