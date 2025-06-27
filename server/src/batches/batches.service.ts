/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { Batch } from '../entities/batch.entity';
import { BatchStatus } from '../enums/batch-status.enum';
import { CreateBatchDto, UpdateBatchDto } from './dto';
import { Ingredient } from '../entities/ingredient.entity';
import { IngredientImport } from '../entities/ingredient-import.entity';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class BatchesService {
  private readonly logger = new Logger(BatchesService.name);

  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(IngredientImport)
    private importRepository: Repository<IngredientImport>,
  ) {}

  private async updateBatchStatus(batch: Batch): Promise<void> {
    const today = new Date();
    const expiryDate = new Date(batch.expiry_date);
    const warningDate = new Date(batch.expiry_date);
    warningDate.setDate(expiryDate.getDate() - 7); // Warning 7 days before expiry

    if (expiryDate < today) {
      batch.status = BatchStatus.EXPIRED;
    } else if (warningDate < today) {
      batch.status = BatchStatus.EXPIRING_SOON; // Changed from WARNING to EXPIRING_SOON
    } else {
      batch.status = BatchStatus.AVAILABLE;
    }

    await this.batchRepository.save(batch);
  }

  private async updateAllBatchesStatus(): Promise<void> {
    const batches = await this.batchRepository.find();
    for (const batch of batches) {
      await this.updateBatchStatus(batch);
    }
  }

  async findAll(
    includeDeleted: boolean = false,
    filters?: {
      ingredient_id?: string;
      supplier_id?: string;
      status?: string;
      expiring_soon?: boolean;
    },
  ): Promise<Batch[]> {
    try {
      this.logger.log('Getting all batches with filters:', filters);

      const queryBuilder = this.batchRepository
        .createQueryBuilder('batch')
        .leftJoinAndSelect('batch.ingredient', 'ingredient')
        .leftJoinAndSelect('batch.import', 'import')
        .leftJoinAndSelect('import.supplier', 'supplier');

      if (!includeDeleted) {
        queryBuilder.andWhere('batch.deleted_at IS NULL');
      }

      // Apply filters
      if (filters) {
        if (filters.ingredient_id) {
          queryBuilder.andWhere('batch.ingredientId = :ingredientId', {
            ingredientId: filters.ingredient_id,
          });
        }

        if (filters.supplier_id) {
          queryBuilder.andWhere('import.supplierId = :supplierId', {
            supplierId: filters.supplier_id,
          });
        }

        if (filters.status) {
          queryBuilder.andWhere('batch.status = :status', {
            status: filters.status,
          });
        }

        if (filters.expiring_soon) {
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
          queryBuilder.andWhere('batch.expiry_date <= :expiryDate', {
            expiryDate: sevenDaysFromNow,
          });
        }
      }

      queryBuilder.orderBy('batch.expiry_date', 'ASC');

      const batches = await queryBuilder.getMany();

      // Update status of all batches
      for (const batch of batches) {
        await this.updateBatchStatus(batch);
      }

      this.logger.log(`Found ${batches.length} batches matching filters`);
      return batches;
    } catch (error) {
      this.logger.error(`Error getting batches: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string, includeDeleted: boolean = false): Promise<Batch> {
    try {
      this.logger.log(`Getting batch with id ${id}`);

      const queryBuilder = this.batchRepository
        .createQueryBuilder('batch')
        .leftJoinAndSelect('batch.ingredient', 'ingredient')
        .leftJoinAndSelect('batch.import', 'import')
        .where('batch.id = :id', { id });

      if (!includeDeleted) {
        queryBuilder.andWhere('batch.deleted_at IS NULL');
      }

      const batch = await queryBuilder.getOne();

      if (!batch) {
        throw new NotFoundException(`Batch with id ${id} not found`);
      }

      // Update batch status
      await this.updateBatchStatus(batch);

      return batch;
    } catch (error) {
      this.logger.error(
        `Error getting batch ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async create(
    createBatchDto: CreateBatchDto,
    userRole: UserRole,
  ): Promise<Batch> {
    try {
      // Check permission
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(
          `User with role ${userRole} attempted to create a batch`,
        );
        throw new BadRequestException(
          'Only admin or warehouse can create batches',
        );
      }

      // Check if ingredient exists
      const ingredient = await this.ingredientRepository.findOne({
        where: { id: createBatchDto.ingredientId, deleted_at: undefined },
      });

      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with id ${createBatchDto.ingredientId} not found`,
        );
      }

      // Check if import exists
      const importRecord = await this.importRepository.findOne({
        where: { id: createBatchDto.importId },
      });

      if (!importRecord) {
        throw new NotFoundException(
          `Import with id ${createBatchDto.importId} not found`,
        );
      }

      this.logger.log(`Creating new batch for ingredient ${ingredient.name}`);
      const batch = this.batchRepository.create(createBatchDto);

      return await this.batchRepository.save(batch);
    } catch (error) {
      this.logger.error(`Error creating batch: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(
    id: string,
    updateBatchDto: UpdateBatchDto,
    userRole: UserRole,
  ): Promise<Batch> {
    try {
      // Check permission
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(
          `User with role ${userRole} attempted to update batch ${id}`,
        );
        throw new BadRequestException(
          'Only admin or warehouse can update batches',
        );
      }

      // Check if batch exists
      const batch = await this.findOne(id);

      // Cannot update the import ID or ingredient ID after creation
      if (
        updateBatchDto.importId &&
        updateBatchDto.importId !== batch.importId
      ) {
        throw new BadRequestException('Cannot update the import ID of a batch');
      }

      if (
        updateBatchDto.ingredientId &&
        updateBatchDto.ingredientId !== batch.ingredientId
      ) {
        throw new BadRequestException(
          'Cannot update the ingredient ID of a batch',
        );
      }

      this.logger.log(`Updating batch ${id}`);
      this.batchRepository.merge(batch, updateBatchDto);

      return await this.batchRepository.save(batch);
    } catch (error) {
      this.logger.error(
        `Error updating batch ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async softDelete(id: string, userRole: UserRole): Promise<boolean> {
    try {
      // Check permission
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(
          `User with role ${userRole} attempted to delete batch ${id}`,
        );
        throw new BadRequestException(
          'Only admin or warehouse can delete batches',
        );
      }

      // Check if batch exists
      await this.findOne(id);

      this.logger.log(`Soft deleting batch ${id}`);
      const result = await this.batchRepository.softDelete(id);

      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      this.logger.error(
        `Error deleting batch ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async restore(id: string, userRole: UserRole): Promise<Batch> {
    try {
      // Check permission
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(
          `User with role ${userRole} attempted to restore batch ${id}`,
        );
        throw new BadRequestException(
          'Only admin or warehouse can restore batches',
        );
      }

      // Check if batch exists but is deleted
      const batch = await this.findOne(id, true);

      if (!batch.deleted_at) {
        throw new BadRequestException(`Batch with id ${id} is not deleted`);
      }

      this.logger.log(`Restoring batch ${id}`);
      await this.batchRepository.restore(id);

      return await this.findOne(id);
    } catch (error) {
      this.logger.error(
        `Error restoring batch ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getExpiringBatches(daysThreshold: number = 7): Promise<Batch[]> {
    try {
      this.logger.log(`Getting batches expiring within ${daysThreshold} days`);

      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + daysThreshold);

      const expiryDate = new Date();

      const batches = await this.batchRepository
        .createQueryBuilder('batch')
        .leftJoinAndSelect('batch.ingredient', 'ingredient')
        .where('batch.deleted_at IS NULL')
        .andWhere('batch.remaining_quantity > 0')
        .andWhere('batch.expiry_date > :today', { today: expiryDate })
        .andWhere('batch.expiry_date <= :warningDate', { warningDate })
        .getMany();

      return batches;
    } catch (error) {
      this.logger.error(
        `Error getting expiring batches: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getBatchesByStatus(
    status: BatchStatus | BatchStatus[],
  ): Promise<Batch[]> {
    try {
      this.logger.log(`Getting batches with status ${status}`);

      const statuses = Array.isArray(status) ? status : [status];

      const batches = await this.batchRepository
        .createQueryBuilder('batch')
        .leftJoinAndSelect('batch.ingredient', 'ingredient')
        .where('batch.deleted_at IS NULL')
        .andWhere('batch.status IN (:...statuses)', { statuses })
        .getMany();

      return batches;
    } catch (error) {
      this.logger.error(
        `Error getting batches by status: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get available batches for an ingredient sorted by expiry date (FIFO)
   * Bao gồm việc lọc theo status available và không hết hạn
   */
  async getAvailableBatchesForIngredient(ingredientId: string) {
    const today = new Date();

    return this.batchRepository.find({
      where: {
        ingredientId,
        status: BatchStatus.AVAILABLE, // Only available batches
        expiry_date: MoreThan(today), // Not expired
        remaining_quantity: MoreThan(0), // Has remaining quantity
        deleted_at: IsNull(), // Not soft deleted
      },
      order: {
        expiry_date: 'ASC', // First Expiry First Out (FIFO)
        created_at: 'ASC', // Tiebreaker by creation date
      },
      relations: ['ingredient', 'import'],
    });
  }

  /**
   * Allocate quantity from available batches using FIFO strategy
   */
  async allocateIngredientQuantity(
    ingredientId: string,
    requiredQuantity: number,
  ) {
    const allocations: { batchId: string; quantity: number }[] = [];
    let remainingQuantity = requiredQuantity;

    // Get available batches sorted by expiry date
    const availableBatches =
      await this.getAvailableBatchesForIngredient(ingredientId);

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;

      const quantityFromBatch = Math.min(
        batch.remaining_quantity,
        remainingQuantity,
      );

      if (quantityFromBatch > 0) {
        allocations.push({
          batchId: batch.id,
          quantity: quantityFromBatch,
        });

        remainingQuantity -= quantityFromBatch;
      }
    }

    // Check if we can fulfill the entire quantity
    if (remainingQuantity > 0) {
      throw new BadRequestException(
        `Insufficient stock for ingredient. Missing ${remainingQuantity} units`,
      );
    }

    return allocations;
  }

  /**
   * Update remaining quantities after allocation
   */
  async updateBatchQuantities(
    allocations: { batchId: string; quantity: number }[],
  ) {
    for (const allocation of allocations) {
      const batch = await this.batchRepository.findOne({
        where: { id: allocation.batchId },
      });

      if (!batch) {
        throw new NotFoundException(`Batch ${allocation.batchId} not found`);
      }

      if (batch.remaining_quantity < allocation.quantity) {
        throw new BadRequestException(
          `Insufficient quantity in batch ${batch.id}`,
        );
      }

      batch.remaining_quantity -= allocation.quantity;
      await this.batchRepository.save(batch);
      await this.updateBatchStatus(batch);
    }
  }

  /**
   * Get total available quantity for an ingredient across all valid batches
   */
  async getAvailableQuantity(ingredientId: string): Promise<number> {
    const batches = await this.getAvailableBatchesForIngredient(ingredientId);
    return batches.reduce(
      (total, batch) => total + batch.remaining_quantity,
      0,
    );
  }

  /**
   * Check if ingredient is below minimum stock quantity
   */
  async checkStock(ingredientId: string): Promise<boolean> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id: ingredientId },
    });
    if (!ingredient) {
      throw new NotFoundException('Nguyên liệu không tồn tại');
    }
    const availableQuantity = await this.getAvailableQuantity(ingredientId);
    return availableQuantity <= ingredient.threshold;
  }

  async getLowStockIngredients(): Promise<
    {
      ingredient: Ingredient;
      availableQuantity: number;
      minStockQuantity: number;
    }[]
  > {
    const ingredients = await this.ingredientRepository.find();
    const lowStockIngredients: {
      ingredient: Ingredient;
      availableQuantity: number;
      minStockQuantity: number;
    }[] = []; // Explicitly typed
    for (const ingredient of ingredients) {
      const availableQuantity = await this.getAvailableQuantity(ingredient.id);
      if (availableQuantity <= ingredient.threshold) {
        lowStockIngredients.push({
          ingredient,
          availableQuantity,
          minStockQuantity: ingredient.threshold,
        });
      }
    }
    return lowStockIngredients;
  }

  async getBatchesNeedingNotification(): Promise<Batch[]> {
    const today = new Date();
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + 7); // Notify for batches expiring within 7 days

    return this.batchRepository
      .createQueryBuilder('batch')
      .where('batch.expiry_date BETWEEN :today AND :warningDate', {
        today,
        warningDate,
      })
      .andWhere('batch.status = :status', { status: BatchStatus.AVAILABLE })
      .getMany();
  }

  async markBatchesAsNotified(batchIds: string[]): Promise<void> {
    this.logger.log(
      `Batches marked as notified (conceptually): ${batchIds.join(', ')}`,
    );
  }
}
