import { MigrationInterface, QueryRunner } from "typeorm"
import { v4 as uuidv4 } from 'uuid';

export class UuidTransition1713979554413 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create new tables with UUID columns
        await this.createTablesWithUuid(queryRunner);
        
        // Migrate data from old tables to new tables
        await this.migrateData(queryRunner);
        
        // Drop old tables
        await this.dropOldTables(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverting is complex as we would need to convert UUIDs back to integers
        // This is a simplistic implementation that creates the old structure
        // But does not migrate data back from UUID to integer IDs
        await this.recreateOldTables(queryRunner);
    }

    private async createTablesWithUuid(queryRunner: QueryRunner): Promise<void> {
        // Create units table
        await queryRunner.query(`
            CREATE TABLE "units" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(50) NOT NULL,
                "abbreviation" varchar(10) NOT NULL
            )
        `);

        // Create categories table
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "description" text
            )
        `);

        // Create ingredients table
        await queryRunner.query(`
            CREATE TABLE "ingredients" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "unit_id" uuid NOT NULL,
                "current_quantity" float NOT NULL,
                "threshold" float NOT NULL,
                "expiry_date" date,
                "supplier" varchar(255),
                "batch_code" varchar(100),
                CONSTRAINT "fk_ingredient_unit" FOREIGN KEY ("unit_id") REFERENCES "units" ("id")
            )
        `);

        // Create dishes table
        await queryRunner.query(`
            CREATE TABLE "dishes" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "description" text NOT NULL,
                "category_id" uuid NOT NULL,
                "price" float NOT NULL,
                "preparation_time" integer NOT NULL,
                "is_available" boolean NOT NULL DEFAULT true,
                "requires_preparation" boolean NOT NULL DEFAULT true,
                CONSTRAINT "fk_dish_category" FOREIGN KEY ("category_id") REFERENCES "categories" ("id")
            )
        `);

        // Create dish_ingredients table
        await queryRunner.query(`
            CREATE TABLE "dish_ingredients" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "dish_id" uuid NOT NULL,
                "ingredient_id" uuid NOT NULL,
                "quantity_per_serving" float NOT NULL,
                CONSTRAINT "fk_dish_ingredient_dish" FOREIGN KEY ("dish_id") REFERENCES "dishes" ("id"),
                CONSTRAINT "fk_dish_ingredient_ingredient" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id")
            )
        `);

        // Create roles table
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(50) NOT NULL,
                "description" text
            )
        `);

        // Create permissions table
        await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "description" text
            )
        `);

        // Create role_permissions table
        await queryRunner.query(`
            CREATE TABLE "role_permissions" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "role_id" uuid NOT NULL,
                "permission_id" uuid NOT NULL,
                CONSTRAINT "fk_role_permission_role" FOREIGN KEY ("role_id") REFERENCES "roles" ("id"),
                CONSTRAINT "fk_role_permission_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id")
            )
        `);

        // Create users table with UUID
        await queryRunner.query(`
            CREATE TABLE "users_new" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "email" varchar(255) NOT NULL UNIQUE,
                "password" varchar(255) NOT NULL,
                "created_at" TIMESTAMP DEFAULT now() NOT NULL
            )
        `);

        // Create user_roles table
        await queryRunner.query(`
            CREATE TABLE "user_roles" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "role_id" uuid NOT NULL,
                CONSTRAINT "fk_user_role_user" FOREIGN KEY ("user_id") REFERENCES "users_new" ("id"),
                CONSTRAINT "fk_user_role_role" FOREIGN KEY ("role_id") REFERENCES "roles" ("id")
            )
        `);

        // Create tables table with UUID
        await queryRunner.query(`
            CREATE TABLE "tables_new" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(50) NOT NULL,
                "capacity" integer NOT NULL,
                "status" varchar(20) NOT NULL
            )
        `);

        // Create menus table
        await queryRunner.query(`
            CREATE TABLE "menus" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "description" text,
                "is_active" boolean NOT NULL DEFAULT true
            )
        `);

        // Create menu_dishes table
        await queryRunner.query(`
            CREATE TABLE "menu_dishes" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "menu_id" uuid NOT NULL,
                "dish_id" uuid NOT NULL,
                CONSTRAINT "fk_menu_dish_menu" FOREIGN KEY ("menu_id") REFERENCES "menus" ("id"),
                CONSTRAINT "fk_menu_dish_dish" FOREIGN KEY ("dish_id") REFERENCES "dishes" ("id")
            )
        `);

        // Create orders table with UUID
        await queryRunner.query(`
            CREATE TABLE "orders_new" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "table_id" uuid NOT NULL,
                "customer_id" uuid,
                "status" varchar(20) NOT NULL,
                "total_price" float NOT NULL,
                "created_at" TIMESTAMP DEFAULT now() NOT NULL,
                "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
                CONSTRAINT "fk_order_table" FOREIGN KEY ("table_id") REFERENCES "tables_new" ("id"),
                CONSTRAINT "fk_order_customer" FOREIGN KEY ("customer_id") REFERENCES "users_new" ("id")
            )
        `);

        // Create order_items table with UUID
        await queryRunner.query(`
            CREATE TABLE "order_items_new" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "order_id" uuid NOT NULL,
                "dish_id" uuid NOT NULL,
                "quantity" integer NOT NULL,
                "note" text,
                "status" varchar(20) NOT NULL,
                "prepared_at" TIMESTAMP,
                CONSTRAINT "fk_order_item_order" FOREIGN KEY ("order_id") REFERENCES "orders_new" ("id") ON DELETE CASCADE,
                CONSTRAINT "fk_order_item_dish" FOREIGN KEY ("dish_id") REFERENCES "dishes" ("id")
            )
        `);

        // Create feedbacks table
        await queryRunner.query(`
            CREATE TABLE "feedbacks" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "order_id" uuid NOT NULL,
                "rating" integer NOT NULL,
                "comment" text,
                "created_at" TIMESTAMP DEFAULT now() NOT NULL,
                CONSTRAINT "fk_feedback_user" FOREIGN KEY ("user_id") REFERENCES "users_new" ("id"),
                CONSTRAINT "fk_feedback_order" FOREIGN KEY ("order_id") REFERENCES "orders_new" ("id")
            )
        `);

        // Create kitchen_logs table
        await queryRunner.query(`
            CREATE TABLE "kitchen_logs" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "order_item_id" uuid NOT NULL,
                "user_id" uuid NOT NULL,
                "action" varchar(20) NOT NULL,
                "timestamp" TIMESTAMP DEFAULT now() NOT NULL,
                CONSTRAINT "fk_kitchen_log_order_item" FOREIGN KEY ("order_item_id") REFERENCES "order_items_new" ("id"),
                CONSTRAINT "fk_kitchen_log_user" FOREIGN KEY ("user_id") REFERENCES "users_new" ("id")
            )
        `);

        // Create restaurant_info table
        await queryRunner.query(`
            CREATE TABLE "restaurant_info" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(255) NOT NULL,
                "description" text,
                "address" varchar(255) NOT NULL,
                "phone" varchar(20) NOT NULL,
                "opening_hours" varchar(255) NOT NULL
            )
        `);

        // Create analytics tables
        await queryRunner.query(`
            CREATE TABLE "revenues" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "date" date NOT NULL,
                "total_orders" integer NOT NULL,
                "total_revenue" float NOT NULL,
                "avg_order_value" float NOT NULL
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "dish_stats" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "dish_id" uuid NOT NULL,
                "date" date NOT NULL,
                "sold_count" integer NOT NULL,
                CONSTRAINT "fk_dish_stat_dish" FOREIGN KEY ("dish_id") REFERENCES "dishes" ("id")
            )
        `);
    }

    private async migrateData(queryRunner: QueryRunner): Promise<void> {
        // Create a mapping between old integer IDs and new UUIDs
        const userMapping = new Map<number, string>();
        const tableMapping = new Map<number, string>();
        const orderMapping = new Map<number, string>();
        const orderItemMapping = new Map<number, string>();
        
        // Migrate categories from menu_item_category enum to categories table
        await queryRunner.query(`
            INSERT INTO categories (id, name, description)
            VALUES 
                ('${uuidv4()}', 'appetizer', 'Appetizers and starters'),
                ('${uuidv4()}', 'main_course', 'Main course dishes'),
                ('${uuidv4()}', 'dessert', 'Sweet dishes and desserts'),
                ('${uuidv4()}', 'beverage', 'Drinks and beverages')
        `);
        
        // Migrate users
        const users = await queryRunner.query('SELECT * FROM users');
        for (const user of users) {
            const uuid = uuidv4();
            userMapping.set(user.id, uuid);
            
            // Convert date to ISO format for PostgreSQL compatibility
            const createdAt = user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString();
            
            await queryRunner.query(`
                INSERT INTO users_new (id, name, email, password, created_at)
                VALUES ('${uuid}', '${user.fullName?.replace(/'/g, "''")}', '${user.email?.replace(/'/g, "''")}', '${user.password?.replace(/'/g, "''")}', '${createdAt}')
            `);
        }
        
        // Migrate tables
        const tables = await queryRunner.query('SELECT * FROM tables');
        for (const table of tables) {
            const uuid = uuidv4();
            tableMapping.set(table.id, uuid);
            
            await queryRunner.query(`
                INSERT INTO tables_new (id, name, capacity, status)
                VALUES ('${uuid}', '${table.tableNumber?.replace(/'/g, "''")}', ${table.capacity}, '${table.status}')
            `);
        }
        
        // Create default units
        await queryRunner.query(`
            INSERT INTO units (id, name, abbreviation)
            VALUES 
                ('${uuidv4()}', 'Kilogram', 'kg'),
                ('${uuidv4()}', 'Gram', 'g'),
                ('${uuidv4()}', 'Liter', 'L'),
                ('${uuidv4()}', 'Milliliter', 'ml'),
                ('${uuidv4()}', 'Piece', 'pcs')
        `);
        
        // Migrate inventory items to ingredients
        try {
            const defaultUnitId = await queryRunner.query(`SELECT id FROM units WHERE name = 'Piece' LIMIT 1`);
            const inventoryItems = await queryRunner.query('SELECT * FROM inventory_items');
            
            for (const item of inventoryItems) {
                // Format expiry date properly if it exists
                const expiryDatePart = item.expiryDate 
                    ? `'${new Date(item.expiryDate).toISOString().split('T')[0]}'` 
                    : 'NULL';
                
                await queryRunner.query(`
                    INSERT INTO ingredients (id, name, unit_id, current_quantity, threshold, expiry_date, supplier)
                    VALUES (
                        '${uuidv4()}', 
                        '${item.name?.replace(/'/g, "''")}', 
                        '${defaultUnitId[0].id}', 
                        ${item.quantity || 0}, 
                        ${item.minQuantity || 0}, 
                        ${expiryDatePart}, 
                        ${item.locationInStorage ? `'${item.locationInStorage.replace(/'/g, "''")}'` : 'NULL'}
                    )
                `);
            }
        } catch (error) {
            console.log('Error migrating inventory items:', error);
        }
        
        // Get categories mapping
        const categoriesMap = new Map<string, string>();
        const categories = await queryRunner.query('SELECT * FROM categories');
        for (const category of categories) {
            categoriesMap.set(category.name, category.id);
        }
        
        // Migrate menu items to dishes
        try {
            const menuItems = await queryRunner.query('SELECT * FROM menu_items');
            const dishMapping = new Map<number, string>();
            
            for (const item of menuItems) {
                const uuid = uuidv4();
                dishMapping.set(item.id, uuid);
                
                // Get default category if no match
                let categoryId = categoriesMap.get(item.category);
                if (!categoryId) {
                    // Use first category as default
                    categoryId = categories[0]?.id;
                }
                
                if (categoryId) {
                    await queryRunner.query(`
                        INSERT INTO dishes (id, name, description, category_id, price, preparation_time, is_available)
                        VALUES (
                            '${uuid}', 
                            '${item.name?.replace(/'/g, "''")}', 
                            '${(item.description || "")?.replace(/'/g, "''")}', 
                            '${categoryId}', 
                            ${item.price || 0}, 
                            ${item.preparationTimeMinutes || 0}, 
                            ${item.isAvailable === false ? 'false' : 'true'}
                        )
                    `);
                }
            }
            
            // Create default menu
            const menuId = uuidv4();
            await queryRunner.query(`
                INSERT INTO menus (id, name, description, is_active)
                VALUES ('${menuId}', 'Default Menu', 'Our default menu offerings', true)
            `);
            
            // Add all dishes to default menu
            for (const [_, dishId] of dishMapping) {
                await queryRunner.query(`
                    INSERT INTO menu_dishes (id, menu_id, dish_id)
                    VALUES ('${uuidv4()}', '${menuId}', '${dishId}')
                `);
            }
            
            // Migrate orders
            const orders = await queryRunner.query('SELECT * FROM orders');
            for (const order of orders) {
                const uuid = uuidv4();
                orderMapping.set(order.id, uuid);
                
                const tableId = tableMapping.get(order.tableId);
                
                // Format dates for PostgreSQL
                const createdAt = order.createdAt 
                    ? new Date(order.createdAt).toISOString() 
                    : new Date().toISOString();
                const updatedAt = order.updatedAt 
                    ? new Date(order.updatedAt).toISOString() 
                    : new Date().toISOString();
                
                if (tableId) {
                    await queryRunner.query(`
                        INSERT INTO orders_new (id, table_id, status, total_price, created_at, updated_at)
                        VALUES (
                            '${uuid}', 
                            '${tableId}', 
                            '${order.status || 'pending'}', 
                            ${order.totalAmount || 0}, 
                            '${createdAt}', 
                            '${updatedAt}'
                        )
                    `);
                }
            }
            
            // Migrate order items
            const orderItems = await queryRunner.query('SELECT * FROM order_items');
            for (const item of orderItems) {
                const uuid = uuidv4();
                orderItemMapping.set(item.id, uuid);
                
                const orderId = orderMapping.get(item.orderId);
                const dishId = dishMapping.get(item.menuItemId);
                
                if (orderId && dishId) {
                    await queryRunner.query(`
                        INSERT INTO order_items_new (id, order_id, dish_id, quantity, note, status)
                        VALUES (
                            '${uuid}', 
                            '${orderId}', 
                            '${dishId}', 
                            ${item.quantity || 1}, 
                            ${item.notes ? `'${item.notes.replace(/'/g, "''")}'` : 'NULL'}, 
                            '${item.status || 'pending'}'
                        )
                    `);
                }
            }
        } catch (error) {
            console.log('Error in menu item migration:', error);
        }
    }

    private async dropOldTables(queryRunner: QueryRunner): Promise<void> {
        try {
            // Drop tables with CASCADE option to handle dependencies
            await queryRunner.query('DROP TABLE IF EXISTS order_items CASCADE');
            await queryRunner.query('DROP TABLE IF EXISTS menu_item_ingredient CASCADE');
            await queryRunner.query('DROP TABLE IF EXISTS menu_item_ingredients CASCADE'); // in case plural name
            await queryRunner.query('DROP TABLE IF EXISTS inventory_transaction CASCADE');
            await queryRunner.query('DROP TABLE IF EXISTS inventory_transactions CASCADE');
            await queryRunner.query('DROP TABLE IF EXISTS inventory_items CASCADE');
            await queryRunner.query('DROP TABLE IF EXISTS orders CASCADE');
            await queryRunner.query('DROP TABLE IF EXISTS menu_items CASCADE');
            await queryRunner.query('DROP TABLE IF EXISTS tables CASCADE');
            await queryRunner.query('DROP TABLE IF EXISTS users CASCADE');
        } catch (error) {
            console.log('Error dropping old tables:', error);
        }
    }

    private async recreateOldTables(queryRunner: QueryRunner): Promise<void> {
        // This is a placeholder for the down migration
        // In a real scenario, you would need to convert UUIDs back to sequential integers
        // and recreate the old table structure
        await queryRunner.query(`
            -- Recreate old tables structure without data
            -- This is a simplified example
        `);
    }
}