import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { IngredientExport } from './ingredient-export.entity';
import { Batch } from './batch.entity';
import { Ingredient } from './ingredient.entity';

@Entity('export_items')
export class ExportItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IngredientExport, exportItem => exportItem.id)
  export: IngredientExport;

  @ManyToOne(() => Batch, batch => batch.id)
  batch: Batch;

  @ManyToOne(() => Ingredient, ingredient => ingredient.id)
  ingredient: Ingredient;

  @Column('float')
  quantity: number;
}
