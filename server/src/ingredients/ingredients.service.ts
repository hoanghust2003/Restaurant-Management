import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { CreateIngredientDto, UpdateIngredientDto } from './dto';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}
  async findAll(includeDeleted: boolean = false): Promise<Ingredient[]> {
    try {
      this.logger.log(`Fetching all ingredients, includeDeleted=${includeDeleted}`);
      if (includeDeleted) {
        return this.ingredientRepository.find({
          withDeleted: true
        });
      }
      return this.ingredientRepository.find();
    } catch (error) {
      this.logger.error(`Error fetching ingredients: ${error.message}`, error.stack);
      throw error;
    }
  }
  async findOne(id: string, includeDeleted: boolean = false): Promise<Ingredient> {
    try {
      this.logger.log(`Finding ingredient by id: ${id}, includeDeleted=${includeDeleted}`);
      const ingredient = await this.ingredientRepository.findOne({
        where: { id },
        withDeleted: includeDeleted
      });
      
      if (!ingredient) {
        this.logger.warn(`Ingredient with ID ${id} not found`);
        throw new NotFoundException(`Ingredient with ID ${id} not found`);
      }
      
      return ingredient;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding ingredient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
  async create(createIngredientDto: CreateIngredientDto, userRole: UserRole): Promise<Ingredient> {
    try {
      // Validate admin, manager or warehouse role for ingredient creation
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to create an ingredient`);
        throw new ForbiddenException('Only admin, manager or warehouse managers can create ingredients');
      }
      
      this.logger.log(`Creating new ingredient: ${createIngredientDto.name}`);
      const ingredient = this.ingredientRepository.create(createIngredientDto);
      
      return await this.ingredientRepository.save(ingredient);
    } catch (error) {
      this.logger.error(`Error creating ingredient: ${error.message}`, error.stack);
      throw error;
    }
  }
  async update(id: string, updateIngredientDto: UpdateIngredientDto, userRole: UserRole): Promise<Ingredient> {
    try {
      // Validate admin, manager or warehouse role for ingredient updates
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to update ingredient ${id}`);
        throw new ForbiddenException('Only admin, manager or warehouse managers can update ingredient information');
      }
      
      this.logger.log(`Updating ingredient ${id}`);
      const ingredient = await this.findOne(id);
      
      this.ingredientRepository.merge(ingredient, updateIngredientDto);
      return await this.ingredientRepository.save(ingredient);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error updating ingredient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }  async remove(id: string, userRole: UserRole): Promise<boolean> {
    try {
      // Validate admin, manager or warehouse role for ingredient deletion
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to delete ingredient ${id}`);
        throw new ForbiddenException('Only admin, manager or warehouse managers can delete ingredients');
      }
      
      this.logger.log(`Soft-deleting ingredient ${id}`);
      // Verify ingredient exists before deletion
      await this.findOne(id);
      
      // Using soft delete instead of hard delete
      const result = await this.ingredientRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Ingredient with ID ${id} not found`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error soft-deleting ingredient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
  async restore(id: string, userRole: UserRole): Promise<Ingredient> {
    try {
      // Validate admin, manager or warehouse role for ingredient restoration
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to restore ingredient ${id}`);
        throw new ForbiddenException('Only admin, manager or warehouse managers can restore ingredients');
      }
      
      this.logger.log(`Restoring soft-deleted ingredient ${id}`);
      // Verify ingredient exists (including deleted ones)
      const ingredient = await this.findOne(id, true);
      
      if (!ingredient.deleted_at) {
        this.logger.warn(`Ingredient ${id} is not deleted, cannot restore`);
        throw new ForbiddenException(`Ingredient with ID ${id} is not deleted`);
      }
      
      // Restore the soft-deleted ingredient
      await this.ingredientRepository.restore(id);
      
      // Return the restored ingredient
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error restoring ingredient ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
