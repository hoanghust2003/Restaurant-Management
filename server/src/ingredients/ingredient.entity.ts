import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  unit: string;

  @Column('float')
  current_quantity: number;

  @Column('float')
  threshold: number;

  @CreateDateColumn()
  created_at: Date;
}
