import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBatchManagement1684654800000 implements MigrationInterface {
    name = 'UpdateBatchManagement1684654800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add status enum type if it doesn't exist
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE batch_status_enum AS ENUM ('available', 'depleted', 'expired', 'expiring_soon', 'damaged', 'on_hold');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Add new columns to batches table
        await queryRunner.query(`
            ALTER TABLE "batches"
            ADD COLUMN IF NOT EXISTS "status" batch_status_enum NOT NULL DEFAULT 'available',
            ADD COLUMN IF NOT EXISTS "is_notified_expiring" boolean NOT NULL DEFAULT false
        `);

        // Update batch statuses based on current data
        await queryRunner.query(`
            UPDATE batches
            SET status = CASE
                WHEN remaining_quantity <= 0 THEN 'depleted'
                WHEN expiry_date < CURRENT_DATE THEN 'expired'
                WHEN expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'expiring_soon'
                ELSE 'available'
            END
        `);

        // Add foreign key constraints if they don't exist
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_batches_ingredient_imports'
                ) THEN
                    ALTER TABLE "batches"
                    ADD CONSTRAINT "FK_batches_ingredient_imports"
                    FOREIGN KEY ("import_id")
                    REFERENCES "ingredient_imports"("id")
                    ON DELETE CASCADE;
                END IF;
            EXCEPTION WHEN others THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_batches_ingredients'
                ) THEN
                    ALTER TABLE "batches"
                    ADD CONSTRAINT "FK_batches_ingredients"
                    FOREIGN KEY ("ingredient_id")
                    REFERENCES "ingredients"("id")
                    ON DELETE CASCADE;
                END IF;
            EXCEPTION WHEN others THEN null;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "batches" DROP CONSTRAINT IF EXISTS "FK_batches_ingredient_imports";
            ALTER TABLE "batches" DROP CONSTRAINT IF EXISTS "FK_batches_ingredients";
        `);

        // Remove new columns
        await queryRunner.query(`
            ALTER TABLE "batches" 
            DROP COLUMN IF EXISTS "status",
            DROP COLUMN IF EXISTS "is_notified_expiring"
        `);

        // Drop the enum type
        await queryRunner.query(`DROP TYPE IF EXISTS batch_status_enum`);
    }
}
