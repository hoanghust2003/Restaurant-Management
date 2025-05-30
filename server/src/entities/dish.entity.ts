import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Category } from './category.entity';
import { DishIngredient } from './dish-ingredient.entity';

@Entity('dishes')
export class Dish {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column('text')
  description: string;

  @Column('float')
  price: number;

  @Column({ nullable: true, length: 255 })
  image_url: string;

  @Column({ default: true })
  is_preparable: boolean;

  @Column({ default: true })
  available: boolean;

  @Column('int')
  preparation_time: number;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, category => category.id)
  @JoinColumn({ name: 'category_id' })
  category: Category;
  
  @OneToMany(() => DishIngredient, dishIngredient => dishIngredient.dish)
  dishIngredients: DishIngredient[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
  
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
