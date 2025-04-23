import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Dish } from './dish.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => Dish, dish => dish.category)
  dishes: Dish[];
}