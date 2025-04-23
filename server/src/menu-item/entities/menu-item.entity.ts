import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from '../../order/entities/order-item.entity';
import { MenuItemIngredient } from './menu-item-ingredient.entity';
import { Dish } from './dish.entity';

// Giữ enum MenuItemCategory để tương thích ngược với code cũ
export enum MenuItemCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
}

// Lớp cha để tương thích với code cũ
@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: MenuItemCategory,
  })
  category: MenuItemCategory;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  preparationTimeMinutes: number;

  // Quan hệ với OrderItem được cập nhật để phù hợp với cả Dish
  @OneToMany(() => OrderItem, (orderItem) => orderItem.dish)
  orderItems: OrderItem[];
  
  @OneToMany(() => MenuItemIngredient, (ingredient) => ingredient.menuItem, {
    cascade: true,
  })
  ingredients: MenuItemIngredient[];
}