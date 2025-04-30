import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoveragePlanTable1711800000002 implements MigrationInterface {
    name = 'CreateCoveragePlanTable1711800000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "coverage_plan" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "serviceType" varchar NOT NULL,
                "coverageType" varchar NOT NULL,
                "coverageDetails" jsonb NOT NULL,
                "corporateClientId" uuid NOT NULL,
                CONSTRAINT "PK_coverage_plan_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_coverage_plan_corporateClientId" FOREIGN KEY ("corporateClientId") REFERENCES "corporate_client"("id") ON DELETE CASCADE
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "coverage_plan"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum`);
    }
}