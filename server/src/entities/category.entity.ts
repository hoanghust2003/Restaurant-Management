import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  description: string;
}
