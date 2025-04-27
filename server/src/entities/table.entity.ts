import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TableStatus } from '../enums/table-status.enum';

@Entity('tables')
export class TableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column('int')
  capacity: number;

  @Column({ type: 'enum', enum: TableStatus })
  status: TableStatus;
}
