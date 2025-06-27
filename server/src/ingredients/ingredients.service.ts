import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { CreateIngredientDto, UpdateIngredientDto } from './dto';
import { UserRole } from '../enums/user-role.enum';
import { Batch } from '../entities/batch.entity';

@Injectable()
export class IngredientsService {
  private readonly logger = new Logger(IngredientsService.name);

  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}
  async findAll(includeDeleted: boolean = false): Promise<any[]> {
    try {
      this.logger.log(
        `Fetching all ingredients, includeDeleted=${includeDeleted}`,
      );
      let ingredients;

      if (includeDeleted) {
        ingredients = await this.ingredientRepository.find({
          withDeleted: true,
        });
      } else {
        ingredients = await this.ingredientRepository.find();
      }

      // Calculate current_quantity for each ingredient
      const ingredientsWithStock = await Promise.all(
        ingredients.map(async (ingredient) => {
          // Get all available batches for this ingredient (not expired and with remaining quantity)
          const today = new Date();
          const batches = await this.batchRepository.find({
            where: {
              ingredientId: ingredient.id,
              remaining_quantity: MoreThan(0),
              // Only count non-expired batches for current quantity
              expiry_date: MoreThan(today),
            },
            order: {
              expiry_date: 'ASC', // Sort by expiry date for FIFO
            },
          });

          // Calculate total remaining quantity from non-expired batches
          const currentQuantity = batches.reduce(
            (sum, batch) => sum + (batch.remaining_quantity || 0),
            0,
          );

          this.logger.debug(
            `Ingredient ${ingredient.name}: ${batches.length} batches, total quantity: ${currentQuantity}`,
          );

          return {
            ...ingredient,
            current_quantity: currentQuantity,
          };
        }),
      );

      this.logger.log(
        `Returning ${ingredientsWithStock.length} ingredients with stock calculations`,
      );
      return ingredientsWithStock;
    } catch (error) {
      this.logger.error(
        `Error fetching ingredients: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async findOne(id: string, includeDeleted: boolean = false): Promise<any> {
    try {
      this.logger.log(
        `Finding ingredient by id: ${id}, includeDeleted=${includeDeleted}`,
      );
      const ingredient = await this.ingredientRepository.findOne({
        where: { id },
        withDeleted: includeDeleted,
      });

      if (!ingredient) {
        this.logger.warn(`Ingredient with ID ${id} not found`);
        throw new NotFoundException(`Ingredient with ID ${id} not found`);
      }

      // Get all available batches for this ingredient
      const batches = await this.batchRepository.find({
        where: {
          ingredientId: ingredient.id,
          remaining_quantity: MoreThan(0),
        },
      });

      // Calculate total remaining quantity
      const currentQuantity = batches.reduce(
        (sum, batch) => sum + (batch.remaining_quantity || 0),
        0,
      );

      return {
        ...ingredient,
        current_quantity: currentQuantity,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding ingredient ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async create(
    createIngredientDto: CreateIngredientDto,
    userRole: UserRole,
  ): Promise<Ingredient> {
    try {
      // Validate admin or warehouse role for ingredient creation
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(
          `User with role ${userRole} attempted to create an ingredient`,
        );
        throw new ForbiddenException(
          'Only admin or warehouse can create ingredients',
        );
      }

      this.logger.log(`Creating new ingredient: ${createIngredientDto.name}`);
      const ingredient = this.ingredientRepository.create(createIngredientDto);

      return await this.ingredientRepository.save(ingredient);
    } catch (error) {
      this.logger.error(
        `Error creating ingredient: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async update(
    id: string,
    updateIngredientDto: UpdateIngredientDto,
    userRole: UserRole,
  ): Promise<Ingredient> {
    try {
      // Validate admin or warehouse role for ingredient updates
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(
          `User with role ${userRole} attempted to update ingredient ${id}`,
        );
        throw new ForbiddenException(
          'Only admin or warehouse can update ingredient information',
        );
      }

      this.logger.log(`Updating ingredient ${id}`);
      const ingredient = await this.findOne(id);

      this.ingredientRepository.merge(ingredient, updateIngredientDto);
      return await this.ingredientRepository.save(ingredient);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Error updating ingredient ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async remove(id: string, userRole: UserRole): Promise<boolean> {
    try {
      // Validate admin or warehouse role for ingredient deletion
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(
          `User with role ${userRole} attempted to delete ingredient ${id}`,
        );
        throw new ForbiddenException(
          'Only admin or warehouse can delete ingredients',
        );
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
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Error soft-deleting ingredient ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async restore(id: string, userRole: UserRole): Promise<Ingredient> {
    try {
      // Validate admin or warehouse role for ingredient restoration
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(
          `User with role ${userRole} attempted to restore ingredient ${id}`,
        );
        throw new ForbiddenException(
          'Only admin or warehouse can restore ingredients',
        );
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
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(
        `Error restoring ingredient ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get ingredients with stock below threshold
   */
  async getLowStock(): Promise<any[]> {
    try {
      this.logger.log('Getting low stock ingredients');

      // Get all non-deleted ingredients
      const ingredients = await this.ingredientRepository.find({
        relations: ['batches'],
      });

      const lowStockItems: any[] = [];

      for (const ingredient of ingredients) {
        // Calculate current quantity from batches
        let availableQuantity = 0;

        if (ingredient.batches && ingredient.batches.length > 0) {
          availableQuantity = ingredient.batches.reduce(
            (sum, batch) => sum + (batch.remaining_quantity || 0),
            0,
          );
        }

        // Check if below threshold
        if (availableQuantity < ingredient.threshold) {
          lowStockItems.push({
            id: ingredient.id,
            name: ingredient.name,
            available_quantity: availableQuantity,
            min_quantity: ingredient.threshold,
            unit: ingredient.unit,
            image_url: ingredient.image_url,
          });
        }
      }

      return lowStockItems;
    } catch (error) {
      this.logger.error(
        `Error getting low stock ingredients: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get ingredient with current stock level
   * @param id Ingredient ID
   */
  async getIngredientWithStock(id: string): Promise<any> {
    try {
      // Get ingredient
      const ingredient = await this.findOne(id);

      // Get all batches for this ingredient with remaining quantity
      const batches = await this.batchRepository.find({
        where: {
          ingredientId: id,
          remaining_quantity: MoreThan(0),
        },
        order: {
          expiry_date: 'ASC',
        },
      });

      // Calculate total quantity
      const totalQuantity = batches.reduce(
        (sum, batch) => sum + batch.remaining_quantity,
        0,
      );

      return {
        ...ingredient,
        current_quantity: totalQuantity,
        batches: batches.map((batch) => ({
          id: batch.id,
          name: batch.name,
          quantity: batch.quantity,
          remaining_quantity: batch.remaining_quantity,
          expiry_date: batch.expiry_date,
          price: batch.price,
        })),
      };
    } catch (error) {
      this.logger.error(
        `Error getting ingredient with stock ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
