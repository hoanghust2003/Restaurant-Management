import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('float')
  price: number;

  @Column({ nullable: true, length: 255 })
  image_url: string;

  @Column({ default: true })
  is_preparable: boolean;

  @Column({ default: true })
  available: boolean;

  @Column('int')
  preparation_time: number;

  @ManyToOne(() => Category, category => category.id)
  category: Category;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
