import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePaymentsTable1622329200000 implements MigrationInterface {
    name = 'CreatePaymentsTable1622329200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "payments",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: "orderId",
                    type: "uuid",
                },
                {
                    name: "amount",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                },
                {
                    name: "transactionId",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "status",
                    type: "varchar",
                    default: "'pending'",
                },
                {
                    name: "paymentMethod",
                    type: "varchar",
                    isNullable: true,
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "paidAt",
                    type: "timestamp",
                    isNullable: true,
                },
            ],
        }), true);

        await queryRunner.createForeignKey("payments", new TableForeignKey({
            columnNames: ["orderId"],
            referencedColumnNames: ["id"],
            referencedTableName: "orders",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("payments");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("orderId") !== -1);
        await queryRunner.dropForeignKey("payments", foreignKey);
        await queryRunner.dropTable("payments");
    }
}
