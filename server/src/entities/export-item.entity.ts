import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { IngredientExport } from './ingredient-export.entity';
import { Batch } from './batch.entity';
import { Ingredient } from './ingredient.entity';

@Entity('export_items')
export class ExportItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'export_id' })
  exportId: string;

  @ManyToOne(() => IngredientExport, export_ => export_.items)
  @JoinColumn({ name: 'export_id' })
  export: IngredientExport;

  @Column({ name: 'batch_id' })
  batchId: string;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @Column({ name: 'ingredient_id' })
  ingredientId: string;

  @ManyToOne(() => Ingredient)
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column('float')
  quantity: number;
}
