import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Menu } from './menu.entity';
import { Dish } from './dish.entity';

@Entity('menu_dishes')
export class MenuDish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'menu_id' })
  menuId: string;

  @ManyToOne(() => Menu, menu => menu.id)
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @Column({ name: 'dish_id' })
  dishId: string;

  @ManyToOne(() => Dish, dish => dish.id)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;
  
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
