import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Menu } from './menu.entity';
import { Dish } from './dish.entity';

@Entity('menu_dishes')
export class MenuDish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Menu, menu => menu.id)
  menu: Menu;

  @ManyToOne(() => Dish, dish => dish.id)
  dish: Dish;
}
