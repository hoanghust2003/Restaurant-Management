import { Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Column } from 'typeorm';
import { Menu } from './menu.entity';
import { Dish } from './dish.entity';

@Entity('menu_dishes')
export class MenuDish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Menu, menu => menu.menuDishes)
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @Column({ name: 'menu_id' })
  menuId: string;

  @ManyToOne(() => Dish, dish => dish.menuDishes)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ name: 'dish_id' })
  dishId: string;
}