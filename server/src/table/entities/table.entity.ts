import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tableNumber: string;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  status: TableStatus;

  @Column({ default: 4 })
  capacity: number;

  @Column({ nullable: true })
  qrCode: string;

  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];
}