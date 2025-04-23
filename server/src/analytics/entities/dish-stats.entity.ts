import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Dish } from '../../menu-item/entities/dish.entity';

@Entity('dish_stats')
export class DishStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dish)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ name: 'dish_id' })
  dishId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column('int')
  sold_count: number;
}