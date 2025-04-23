import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MenuDish } from './menu-dish.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('boolean', { default: true })
  is_active: boolean;

  @OneToMany(() => MenuDish, menuDish => menuDish.menu)
  menuDishes: MenuDish[];
}