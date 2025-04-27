import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Dish } from './dish.entity';
import { Ingredient } from './ingredient.entity';

@Entity('dish_ingredients')
export class DishIngredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dish, dish => dish.id)
  dish: Dish;

  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  ingredient: Ingredient;

  @Column('float')
  quantity: number;
}
