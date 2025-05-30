import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch } from '../../entities/batch.entity';
import { BatchStatus } from '../../enums/batch-status.enum'; // Corrected import
import { MoreThan, Repository, LessThan } from 'typeorm';

interface BatchAllocation {
  batchId: string;
  quantity: number;
}

@Injectable()
export class BatchAllocationService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}

  /**
   * Allocates ingredient quantity from available batches using FIFO (First Expiry First Out)
   * @param ingredientId The ID of the ingredient to allocate
   * @param requiredQuantity The quantity needed
   * @returns Array of batch allocations or null if insufficient quantity
   */
  async allocateFromBatches(
    ingredientId: string,
    requiredQuantity: number,
  ): Promise<BatchAllocation[] | null> {
    const availableBatches = await this.batchRepository.find({
      where: {
        ingredientId,
        status: BatchStatus.AVAILABLE,
        remaining_quantity: MoreThan(0),
        expiry_date: MoreThan(new Date()), // Only non-expired batches
      },
      order: {
        expiry_date: 'ASC', // First Expiry First Out
        created_at: 'ASC',  // For batches with same expiry date, use older ones first
      },
    });

    if (!availableBatches.length) {
      return null;
    }

    let remainingRequired = requiredQuantity;
    const allocations: BatchAllocation[] = [];

    for (const batch of availableBatches) {
      if (remainingRequired <= 0) break;

      const allocatedQuantity = Math.min(batch.remaining_quantity, remainingRequired);
      
      allocations.push({
        batchId: batch.id,
        quantity: allocatedQuantity,
      });

      remainingRequired -= allocatedQuantity;
    }

    // If we couldn't allocate enough quantity
    if (remainingRequired > 0) {
      return null;
    }

    return allocations;
  }

  /**
   * Updates batch quantities after allocation
   * @param allocations Array of batch allocations to process
   */
  async processBatchAllocations(allocations: BatchAllocation[]): Promise<void> {
    for (const allocation of allocations) {
      const batch = await this.batchRepository.findOne({
        where: { id: allocation.batchId }
      });

      if (batch) {
        batch.remaining_quantity -= allocation.quantity;
        await this.batchRepository.save(batch);
      }
    }
  }

  /**
   * Checks if we have sufficient quantity across all available batches
   * @param ingredientId The ID of the ingredient to check
   * @param requiredQuantity The quantity needed
   * @returns boolean indicating if sufficient quantity is available
   */
  async hasSufficientQuantity(
    ingredientId: string,
    requiredQuantity: number,
  ): Promise<boolean> {
    const totalAvailable = await this.batchRepository
      .createQueryBuilder('batch')
      .where('batch.ingredientId = :ingredientId', { ingredientId })
      .andWhere('batch.status = :status', { status: BatchStatus.AVAILABLE })
      .andWhere('batch.remaining_quantity > 0')
      .andWhere('batch.expiry_date > :now', { now: new Date() })
      .select('SUM(batch.remaining_quantity)', 'total')
      .getRawOne();

    return totalAvailable?.total >= requiredQuantity;
  }

  /**
   * Gets all batches that are expiring soon
   * @param daysThreshold Number of days to consider as "expiring soon"
   * @returns Array of batches that are expiring soon
   */
  async getExpiringBatches(daysThreshold: number = 7): Promise<Batch[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.batchRepository.find({
      where: {
        status: BatchStatus.AVAILABLE,
        remaining_quantity: MoreThan(0),
        expiry_date: LessThan(thresholdDate),
      },
      relations: ['ingredient'],
      order: {
        expiry_date: 'ASC',
      },
    });
  }
}
