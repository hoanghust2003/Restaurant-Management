import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { DishIngredient } from './dish-ingredient.entity';
import { Batch } from './batch.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 50 })
  unit: string;

  @Column('float')
  threshold: number;

  @Column({ length: 255, nullable: true })
  image_url: string;

  @OneToMany(() => DishIngredient, dishIngredient => dishIngredient.ingredient)
  dishIngredients: DishIngredient[];

  @OneToMany(() => Batch, batch => batch.ingredient)
  batches: Batch[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
