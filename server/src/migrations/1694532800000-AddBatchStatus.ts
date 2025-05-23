import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBatchStatus1694532800000 implements MigrationInterface {
    name = 'AddBatchStatus1694532800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "batches" 
            ADD COLUMN "status" varchar(255) NOT NULL DEFAULT 'available' 
            CHECK (status IN ('available', 'depleted', 'expired', 'damaged', 'expiring_soon'))
        `);

        // Update status based on current data
        await queryRunner.query(`
            UPDATE "batches" 
            SET status = 
                CASE
                    WHEN remaining_quantity <= 0 THEN 'depleted'
                    WHEN expiry_date < CURRENT_DATE THEN 'expired'
                    WHEN expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
                    ELSE 'available'
                END
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "status"`);
    }
}
