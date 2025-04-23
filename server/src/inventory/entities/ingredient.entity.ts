import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Unit } from './unit.entity';
import { DishIngredient } from './dish-ingredient.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @ManyToOne(() => Unit, unit => unit.ingredients)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ name: 'unit_id' })
  unitId: string;

  @Column('float')
  current_quantity: number;

  @Column('float')
  threshold: number;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ length: 255, nullable: true })
  supplier: string;

  @Column({ length: 100, nullable: true })
  batch_code: string;

  @OneToMany(() => DishIngredient, dishIngredient => dishIngredient.ingredient)
  dishIngredients: DishIngredient[];
}