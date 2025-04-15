import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from '../../order/entities/order-item.entity';

export enum MenuItemCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
}

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

  @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
  orderItems: OrderItem[];
}