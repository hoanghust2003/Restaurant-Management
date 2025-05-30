import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Dish } from './dish.entity';
import { Ingredient } from './ingredient.entity';

@Entity('dish_ingredients')
export class DishIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dish_id' })
  dishId: string;

  @ManyToOne(() => Dish, dish => dish.id)
  @JoinColumn({ name: 'dish_id' })
  dish: Dish;

  @Column({ name: 'ingredient_id' })
  ingredientId: string;

  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column('float')
  quantity: number;
  
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
