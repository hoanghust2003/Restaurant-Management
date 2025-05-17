import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  unit: string;

  @Column('float')
  threshold: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
