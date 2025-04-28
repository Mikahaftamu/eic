import { MigrationInterface, QueryRunner } from 'typeorm';

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

      // 2. Drop the old enum type if it exists
      await queryRunner.query(`
        DROP TYPE IF EXISTS payment_status_enum CASCADE;
      `);

      // 3. Create the new enum type
      await queryRunner.query(`
        CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
      `);

      // 4. Check if the status column exists
      const columnExists = await queryRunner.hasColumn('payment', 'status');
      if (!columnExists)
      {
        // Create the status column if it doesn't exist
        await queryRunner.query(`
          ALTER TABLE payment 
          ADD COLUMN status payment_status_enum DEFAULT 'PENDING';
        `);
        console.log('Created status column with default value PENDING');
        await queryRunner.commitTransaction();
        return;
      }

      // 5. Add a new column with the new enum type
      await queryRunner.query(`
        ALTER TABLE payment 
        ADD COLUMN status_new payment_status_enum DEFAULT 'PENDING';
      `);

      // 6. Update the new column with values from the old column
      await queryRunner.query(`
        UPDATE payment 
        SET status_new = CASE 
          WHEN status::text = 'PENDING' THEN 'PENDING'::payment_status_enum
          WHEN status::text = 'COMPLETED' THEN 'COMPLETED'::payment_status_enum
          WHEN status::text = 'FAILED' THEN 'FAILED'::payment_status_enum
          WHEN status::text = 'REFUNDED' THEN 'REFUNDED'::payment_status_enum
          ELSE 'PENDING'::payment_status_enum
        END;
      `);

      // 7. Drop the old column and rename the new one
      await queryRunner.query(`
        ALTER TABLE payment 
        DROP COLUMN status;
      `);

      await queryRunner.query(`
        ALTER TABLE payment 
        RENAME COLUMN status_new TO status;
      `);

      // Commit transaction
      await queryRunner.commitTransaction();
      console.log('Migration completed successfully');

    } catch (err)
    {
      // Rollback on any error
      await queryRunner.rollbackTransaction();
      console.error('Migration failed:', err);
      throw err;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void>
  {
    // This migration cannot be safely reverted
    console.warn(`
      WARNING: This migration cannot be safely reverted automatically.
      To revert, you would need to restore from a backup.
    `);
  }
}