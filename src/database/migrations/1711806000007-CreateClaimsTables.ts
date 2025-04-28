import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { ClaimStatus, ClaimType, SubmissionType } from '../../claims/entities/claim.entity';
import { ClaimItemStatus } from '../../claims/entities/claim-item.entity';
import { AdjustmentType } from '../../claims/entities/claim-adjustment.entity';
import { AppealStatus } from '../../claims/entities/claim-appeal.entity';

export class CreateClaimsTables1711806000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE claim_status_enum AS ENUM (${Object.values(ClaimStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE claim_type_enum AS ENUM (${Object.values(ClaimType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE submission_type_enum AS ENUM (${Object.values(SubmissionType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE claim_item_status_enum AS ENUM (${Object.values(ClaimItemStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE adjustment_type_enum AS ENUM (${Object.values(AdjustmentType).map(type => `'${type}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE appeal_status_enum AS ENUM (${Object.values(AppealStatus).map(status => `'${status}'`).join(', ')});
        EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create claims table
    await queryRunner.createTable(
      new Table({
        name: 'claims',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'insuranceCompanyId',
            type: 'uuid',
          },
          {
            name: 'memberId',
            type: 'uuid',
          },
          {
            name: 'providerId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'claimNumber',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'claim_status_enum',
            default: "'SUBMITTED'",
          },
          {
            name: 'claimType',
            type: 'enum',
            enumName: 'claim_type_enum',
            default: "'MEDICAL'",
          },
          {
            name: 'submissionType',
            type: 'enum',
            enumName: 'submission_type_enum',
            default: "'ELECTRONIC'",
          },
          {
            name: 'serviceStartDate',
            type: 'date',
          },
          {
            name: 'serviceEndDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'submissionDate',
            type: 'date',
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'approvedAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'paidAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'memberResponsibility',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'denialReason',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'diagnosisCode',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'additionalDiagnosisCodes',
            type: 'varchar',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'isEmergency',
            type: 'boolean',
            default: false,
          },
          {
            name: 'preAuthorizationRequired',
            type: 'boolean',
            default: false,
          },
          {
            name: 'preAuthorizationNumber',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'isOutOfNetwork',
            type: 'boolean',
            default: false,
          },
          {
            name: 'notes',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'additionalData',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'isDeleted',
            type: 'boolean',
            default: false,
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

    // Create claim_items table
    await queryRunner.createTable(
      new Table({
        name: 'claim_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'claimId',
            type: 'uuid',
          },
          {
            name: 'serviceCode',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'serviceDescription',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'serviceDate',
            type: 'date',
          },
          {
            name: 'quantity',
            type: 'int',
            default: 1,
          },
          {
            name: 'unitPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'totalPrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'approvedAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'paidAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'memberResponsibility',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'claim_item_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'denialReason',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'modifiers',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'isExcludedService',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isPreventiveCare',
            type: 'boolean',
            default: false,
          },
          {
            name: 'additionalData',
            type: 'jsonb',
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

    // Create claim_adjustments table
    await queryRunner.createTable(
      new Table({
        name: 'claim_adjustments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'claimId',
            type: 'uuid',
          },
          {
            name: 'claimItemId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'adjustmentType',
            type: 'enum',
            enumName: 'adjustment_type_enum',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'appliedById',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'referenceNumber',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'adjustmentDate',
            type: 'date',
          },
          {
            name: 'additionalData',
            type: 'jsonb',
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

    // Create claim_appeals table
    await queryRunner.createTable(
      new Table({
        name: 'claim_appeals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'claimId',
            type: 'uuid',
          },
          {
            name: 'submittedById',
            type: 'uuid',
          },
          {
            name: 'appealNumber',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'appeal_status_enum',
            default: "'SUBMITTED'",
          },
          {
            name: 'submissionDate',
            type: 'date',
          },
          {
            name: 'reason',
            type: 'varchar',
            length: '1000',
          },
          {
            name: 'supportingInformation',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'documentReferences',
            type: 'varchar',
            isArray: true,
            isNullable: true,
          },
          {
            name: 'reviewedById',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'decisionNotes',
            type: 'varchar',
            length: '1000',
            isNullable: true,
          },
          {
            name: 'originalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'appealedAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'approvedAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'isEscalated',
            type: 'boolean',
            default: false,
          },
          {
            name: 'appealLevel',
            type: 'int',
            default: 1,
          },
          {
            name: 'additionalData',
            type: 'jsonb',
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

    // Add foreign keys
    await queryRunner.createForeignKeys('claims', [
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
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['providerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'providers',
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.createForeignKeys('claim_items', [
      new TableForeignKey({
        columnNames: ['claimId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'claims',
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createForeignKeys('claim_adjustments', [
      new TableForeignKey({
        columnNames: ['claimId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'claims',
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['claimItemId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'claim_items',
        onDelete: 'SET NULL',
      }),
    ]);

    await queryRunner.createForeignKeys('claim_appeals', [
      new TableForeignKey({
        columnNames: ['claimId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'claims',
        onDelete: 'CASCADE',
      }),
    ]);

    // Add triggers for updatedAt
    await queryRunner.query(`
      CREATE TRIGGER update_claims_updated_at
        BEFORE UPDATE ON claims
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_claim_items_updated_at
        BEFORE UPDATE ON claim_items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_claim_adjustments_updated_at
        BEFORE UPDATE ON claim_adjustments
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_claim_appeals_updated_at
        BEFORE UPDATE ON claim_appeals
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers first
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
      DROP TRIGGER IF EXISTS update_claim_items_updated_at ON claim_items;
      DROP TRIGGER IF EXISTS update_claim_adjustments_updated_at ON claim_adjustments;
      DROP TRIGGER IF EXISTS update_claim_appeals_updated_at ON claim_appeals;
    `);

    // Drop foreign keys
    await queryRunner.dropForeignKey('claims', 'FK_claims_insuranceCompanyId');
    await queryRunner.dropForeignKey('claims', 'FK_claims_memberId');
    await queryRunner.dropForeignKey('claims', 'FK_claims_providerId');
    await queryRunner.dropForeignKey('claim_items', 'FK_claim_items_claimId');
    await queryRunner.dropForeignKey('claim_adjustments', 'FK_claim_adjustments_claimId');
    await queryRunner.dropForeignKey('claim_adjustments', 'FK_claim_adjustments_claimItemId');
    await queryRunner.dropForeignKey('claim_appeals', 'FK_claim_appeals_claimId');

    // Drop tables
    await queryRunner.dropTable('claim_appeals');
    await queryRunner.dropTable('claim_adjustments');
    await queryRunner.dropTable('claim_items');
    await queryRunner.dropTable('claims');

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE IF EXISTS claim_status_enum;
      DROP TYPE IF EXISTS claim_type_enum;
      DROP TYPE IF EXISTS submission_type_enum;
      DROP TYPE IF EXISTS claim_item_status_enum;
      DROP TYPE IF EXISTS adjustment_type_enum;
      DROP TYPE IF EXISTS appeal_status_enum;
    `);
  }
} 