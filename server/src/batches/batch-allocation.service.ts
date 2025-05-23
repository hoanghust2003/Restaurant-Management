import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { BatchAllocation } from '../interfaces/batch-allocation.interface';
import { Batch } from '../entities/batch.entity';
import { BatchStatus } from '../enums/batch-status.enum';

@Injectable()
export class BatchAllocationService {
  private readonly logger = new Logger(BatchAllocationService.name);

  constructor(
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
  ) {}

  /**
   * Get batches for ingredient allocation using FIFO strategy
   * @param ingredientId The ingredient to allocate
   * @param requiredQuantity The quantity needed
   * @returns Array of batch allocations
   */
  async allocateIngredientForOrder(ingredientId: string, requiredQuantity: number): Promise<BatchAllocation[]> {
    try {
      // Get available batches for this ingredient, ordered by expiry date (FIFO)
      const availableBatches = await this.batchRepository.find({
        where: {
          ingredientId,
          status: BatchStatus.AVAILABLE,
          remaining_quantity: MoreThan(0)
        },
        order: {
          expiry_date: 'ASC' // FIFO - First Expiry First Out
        }
      });

      if (!availableBatches.length) {
        throw new BadRequestException(`No available batches found for ingredient ${ingredientId}`);
      }

      let remainingQuantity = requiredQuantity;
      const allocations: BatchAllocation[] = [];

      // Allocate from batches until we have enough quantity
      for (const batch of availableBatches) {
        if (remainingQuantity <= 0) break;

        const quantityFromBatch = Math.min(batch.remaining_quantity, remainingQuantity);
        
        allocations.push({
          batchId: batch.id,
          quantity: quantityFromBatch,
          expiryDate: batch.expiry_date,
          price: batch.price
        });

        remainingQuantity -= quantityFromBatch;
      }

      // Check if we could allocate the full quantity
      if (remainingQuantity > 0) {
        throw new BadRequestException(`Insufficient quantity available for ingredient ${ingredientId}. Missing ${remainingQuantity} units`);
      }

      return allocations;
    } catch (error) {
      this.logger.error(`Error allocating ingredient ${ingredientId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get best batches for a list of ingredients needed for an order
   * @param ingredients Array of ingredients with required quantities
   * @returns Batch allocations for each ingredient
   */
  async allocateIngredientsForOrder(ingredients: { ingredientId: string; quantity: number }[]): Promise<Map<string, BatchAllocation[]>> {
    const allAllocations = new Map<string, BatchAllocation[]>();

    try {
      for (const ingredient of ingredients) {
        const allocations = await this.allocateIngredientForOrder(
          ingredient.ingredientId,
          ingredient.quantity
        );
        
        allAllocations.set(ingredient.ingredientId, allocations);
      }

      return allAllocations;
    } catch (error) {
      this.logger.error('Error allocating ingredients for order:', error.stack);
      throw error;
    }
  }

  /**
   * Get the expiry status of allocated batches
   * @param allocations The batch allocations to check
   * @returns Object containing warning information for batches close to expiry
   */
  getExpiryWarnings(allocations: BatchAllocation[]): { 
    hasWarnings: boolean;
    warnings: { batchId: string; daysUntilExpiry: number }[];
  } {
    const warnings: { batchId: string; daysUntilExpiry: number }[] = [];
    const today = new Date();
    
    for (const allocation of allocations) {
      const daysUntilExpiry = Math.ceil(
        (allocation.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Warn if batch will expire within 7 days
      if (daysUntilExpiry <= 7) {
        warnings.push({
          batchId: allocation.batchId,
          daysUntilExpiry
        });
      }
    }

    return {
      hasWarnings: warnings.length > 0,
      warnings
    };
  }
}
