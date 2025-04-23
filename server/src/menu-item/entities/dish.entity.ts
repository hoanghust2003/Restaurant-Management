import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { DishIngredient } from '../../inventory/entities/dish-ingredient.entity';
import { MenuDish } from './menu-dish.entity';
import { OrderItem } from '../../order/entities/order-item.entity';

@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column('float')
  price: number;

  @Column('int')
  preparation_time: number;

  @Column('boolean', { default: true })
  is_available: boolean;

  @Column('boolean', { default: true })
  requires_preparation: boolean;

  @OneToMany(() => DishIngredient, dishIngredient => dishIngredient.dish)
  dishIngredients: DishIngredient[];

  @OneToMany(() => MenuDish, menuDish => menuDish.dish)
  menuDishes: MenuDish[];

  @OneToMany(() => OrderItem, orderItem => orderItem.dish)
  orderItems: OrderItem[];
}