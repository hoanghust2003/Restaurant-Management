import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaymentCompletedAtToOrders1685548800001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'payment_completed_at',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'payment_completed_at');
  }
}
