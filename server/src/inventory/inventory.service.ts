import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, DataSource } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { Unit } from './entities/unit.entity';
import { DishIngredient } from './entities/dish-ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(DishIngredient)
    private dishIngredientRepository: Repository<DishIngredient>,
    private dataSource: DataSource,
  ) {}

  // Unit management
  async createUnit(createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitRepository.create(createUnitDto);
    return await this.unitRepository.save(unit);
  }

  async findAllUnits(): Promise<Unit[]> {
    return await this.unitRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOneUnit(id: string): Promise<Unit> {
    const unit = await this.unitRepository.findOne({ 
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async updateUnit(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findOneUnit(id);
    
    Object.assign(unit, updateUnitDto);
    
    return await this.unitRepository.save(unit);
  }

  async removeUnit(id: string): Promise<void> {
    // Check if unit is in use by any ingredient
    const inUse = await this.ingredientRepository.findOne({
      where: { unitId: id }
    });

    if (inUse) {
      throw new BadRequestException(`Cannot delete unit that is in use by ingredients`);
    }

    const unit = await this.findOneUnit(id);
    await this.unitRepository.remove(unit);
  }

  // Ingredient management
  async createIngredient(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    // Verify unit exists
    await this.findOneUnit(createIngredientDto.unitId);
    
    const ingredient = this.ingredientRepository.create(createIngredientDto);
    return await this.ingredientRepository.save(ingredient);
  }

  async findAllIngredients(): Promise<Ingredient[]> {
    return await this.ingredientRepository.find({
      relations: ['unit'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findLowStockIngredients(): Promise<Ingredient[]> {
    return await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .innerJoinAndSelect('ingredient.unit', 'unit')
      .where('ingredient.current_quantity <= ingredient.threshold')
      .orderBy('ingredient.name', 'ASC')
      .getMany();
  }

  async findExpiringIngredients(daysThreshold: number = 7): Promise<Ingredient[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return await this.ingredientRepository.find({
      where: {
        expiry_date: LessThanOrEqual(thresholdDate),
      },
      relations: ['unit'],
      order: {
        expiry_date: 'ASC',
      },
    });
  }

  async findOneIngredient(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findOne({ 
      where: { id },
      relations: ['unit'],
    });

    if (!ingredient) {
      throw new NotFoundException(`Ingredient with ID ${id} not found`);
    }

    return ingredient;
  }

  async updateIngredient(id: string, updateIngredientDto: UpdateIngredientDto): Promise<Ingredient> {
    const ingredient = await this.findOneIngredient(id);
    
    // If updating unit ID, verify the unit exists
    if (updateIngredientDto.unitId && updateIngredientDto.unitId !== ingredient.unitId) {
      await this.findOneUnit(updateIngredientDto.unitId);
    }
    
    Object.assign(ingredient, updateIngredientDto);
    
    return await this.ingredientRepository.save(ingredient);
  }

  async removeIngredient(id: string): Promise<void> {
    // Check if ingredient is used in any dish
    const inUse = await this.dishIngredientRepository.findOne({
      where: { ingredientId: id }
    });

    if (inUse) {
      throw new BadRequestException(`Cannot delete ingredient that is in use by dishes`);
    }

    const ingredient = await this.findOneIngredient(id);
    await this.ingredientRepository.remove(ingredient);
  }

  // Dish-ingredient relationship management
  async getDishIngredients(dishId: string): Promise<DishIngredient[]> {
    return await this.dishIngredientRepository.find({
      where: { dishId },
      relations: ['ingredient', 'ingredient.unit'],
      order: {
        ingredient: {
          name: 'ASC'
        }
      },
    });
  }

  async addIngredientToDish(dishId: string, ingredientId: string, quantity: number): Promise<DishIngredient> {
    // Check if ingredient exists
    await this.findOneIngredient(ingredientId);

    // Check if dish-ingredient relation already exists
    const existing = await this.dishIngredientRepository.findOne({
      where: { 
        dishId,
        ingredientId
      }
    });

    if (existing) {
      // Update quantity if already exists
      existing.quantityPerServing = quantity;
      return await this.dishIngredientRepository.save(existing);
    }

    // Create new relationship
    const dishIngredient = this.dishIngredientRepository.create({
      dishId,
      ingredientId,
      quantityPerServing: quantity
    });
    
    return await this.dishIngredientRepository.save(dishIngredient);
  }

  async updateDishIngredient(dishId: string, ingredientId: string, quantity: number): Promise<DishIngredient> {
    const dishIngredient = await this.dishIngredientRepository.findOne({
      where: { 
        dishId,
        ingredientId
      }
    });

    if (!dishIngredient) {
      throw new NotFoundException(`Ingredient with ID ${ingredientId} not found for dish with ID ${dishId}`);
    }
    
    dishIngredient.quantityPerServing = quantity;
    
    return await this.dishIngredientRepository.save(dishIngredient);
  }

  async removeIngredientFromDish(dishId: string, ingredientId: string): Promise<void> {
    const dishIngredient = await this.dishIngredientRepository.findOne({
      where: { 
        dishId,
        ingredientId
      }
    });

    if (!dishIngredient) {
      throw new NotFoundException(`Ingredient with ID ${ingredientId} not found for dish with ID ${dishId}`);
    }
    
    await this.dishIngredientRepository.remove(dishIngredient);
  }

  // Inventory reporting and analytics
  async getInventorySummary() {
    // Count total ingredients
    const totalCount = await this.ingredientRepository.count();

    // Count low stock ingredients
    const lowStockCount = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('ingredient.current_quantity <= ingredient.threshold')
      .getCount();

    // Count expiring ingredients (within 7 days)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + 7);
    
    const expiringCount = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('ingredient.expiry_date <= :thresholdDate', { thresholdDate })
      .getCount();

    return {
      totalIngredients: totalCount,
      lowStockCount,
      expiringCount,
    };
  }
}
