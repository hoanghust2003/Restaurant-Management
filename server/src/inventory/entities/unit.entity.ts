import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Ingredient } from './ingredient.entity';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 10 })
  abbreviation: string;

  @OneToMany(() => Ingredient, ingredient => ingredient.unit)
  ingredients: Ingredient[];
}