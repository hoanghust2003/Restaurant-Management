import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('revenues')
export class Revenue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column('int')
  total_orders: number;

  @Column('float')
  total_revenue: number;

  @Column('float')
  avg_order_value: number;
}