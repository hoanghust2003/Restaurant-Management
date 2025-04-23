import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';

@Entity('menu_item_ingredients')
export class MenuItemIngredient {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.ingredients, { onDelete: 'CASCADE' })
  menuItem: MenuItem;

  @Column()
  menuItemId: number;

  @ManyToOne(() => InventoryItem)
  ingredient: InventoryItem;
  
  @Column()
  ingredientId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;
}