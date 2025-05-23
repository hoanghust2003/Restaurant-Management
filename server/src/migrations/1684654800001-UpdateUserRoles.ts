import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRoles1684654800001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Đảm bảo tất cả user role không hợp lệ chuyển về 'staff' hoặc 'admin'
        await queryRunner.query(`
            UPDATE users 
            SET role = 'staff' 
            WHERE role IN ('waiter', 'cashier')
        `);
        await queryRunner.query(`
            UPDATE users 
            SET role = 'admin' 
            WHERE role = 'manager'
        `);

        // Drop the existing enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."users_role_enum";
        `);

        // Create the new enum type with updated values
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM(
                'admin', 'staff', 'chef', 'warehouse', 'customer'
            );
        `);

        // Alter the column to use the new enum type
        await queryRunner.query(`
            ALTER TABLE users 
            ALTER COLUMN role TYPE "public"."users_role_enum" 
            USING role::text::"public"."users_role_enum"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Nếu rollback thì chuyển staff về waiter, admin về manager (nếu cần)
        await queryRunner.query(`
            UPDATE users 
            SET role = 'waiter' 
            WHERE role = 'staff'
        `);
        await queryRunner.query(`
            UPDATE users 
            SET role = 'manager' 
            WHERE role = 'admin'
        `);

        // Drop the existing enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "public"."users_role_enum";
        `);

        // Create the old enum type
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM(
                'admin', 'manager', 'waiter', 'chef', 'cashier', 'warehouse', 'customer'
            );
        `);

        // Alter the column to use the old enum type
        await queryRunner.query(`
            ALTER TABLE users 
            ALTER COLUMN role TYPE "public"."users_role_enum" 
            USING role::text::"public"."users_role_enum"
        `);
    }
}
