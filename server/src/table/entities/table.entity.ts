import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../order/entities/order.entity';

export enum TableStatus {
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
  CLEANING = 'cleaning',
  VACANT = 'vacant' // Alias for VACANT to maintain backward compatibility
}

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column('int')
  capacity: number;

  @Column({ 
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.VACANT
  })
  status: TableStatus;

  @Column({ nullable: true })
  qrCodeUrl: string;

  @OneToMany(() => Order, order => order.table)
  orders: Order[];
}