import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull, LessThan, MoreThan } from 'typeorm';
import { IngredientExport } from '../entities/ingredient-export.entity'; // Corrected path
import { ExportItem } from '../entities/export-item.entity'; // Corrected path
import { Batch } from '../entities/batch.entity'; // Corrected path
import { CreateExportDto } from '../inventory/dto/create-export.dto'; // Assuming DTO path
import { User } from '../entities/user.entity'; // Assuming User entity path
import { BatchStatus } from '../enums/batch-status.enum'; // Added import for BatchStatus

@Injectable()
export class IngredientExportsService {
  constructor(
    @InjectRepository(IngredientExport)
    private readonly exportRepository: Repository<IngredientExport>,
    @InjectRepository(ExportItem)
    private readonly exportItemRepository: Repository<ExportItem>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    private readonly dataSource: DataSource,
  ) {}

  private async allocateBatchesForIngredient(
    ingredientId: string,
    quantity: number,
  ) {
    const today = new Date();

    // Get available batches sorted by expiry date (FIFO - First In, First Out)
    // Prioritize batches that expire soonest to reduce waste
    const availableBatches = await this.batchRepository.find({
      where: {
        ingredientId: ingredientId,
        status: BatchStatus.AVAILABLE,
        remaining_quantity: MoreThan(0),
        expiry_date: MoreThan(today), // Only non-expired batches
        deleted_at: IsNull(),
      },
      order: {
        expiry_date: 'ASC', // Expiry date first (FIFO based on expiry)
        created_at: 'ASC', // Then by creation time for tie-breaking
      },
    });

    if (availableBatches.length === 0) {
      throw new BadRequestException(
        `Không có lô hàng khả dụng cho nguyên liệu ${ingredientId}`,
      );
    }

    const allocations: { batchId: string; quantity: number }[] = [];
    let remainingQuantity = quantity;

    // Allocate from earliest expiring batches first
    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;

      const allocationQuantity = Math.min(
        batch.remaining_quantity,
        remainingQuantity,
      );

      if (allocationQuantity > 0) {
        allocations.push({
          batchId: batch.id,
          quantity: allocationQuantity,
        });

        remainingQuantity -= allocationQuantity;
      }
    }

    if (remainingQuantity > 0) {
      const totalAvailable = availableBatches.reduce(
        (sum, batch) => sum + batch.remaining_quantity,
        0,
      );
      throw new BadRequestException(
        `Không đủ số lượng nguyên liệu trong kho. Cần: ${quantity}, Có sẵn: ${totalAvailable}`,
      );
    }

    return allocations;
  }

  async create(
    createExportDto: CreateExportDto,
    userId: string,
  ): Promise<IngredientExport> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create export record
      const exportRecord = this.exportRepository.create({
        createdById: userId,
        reason: createExportDto.reason,
        created_at: createExportDto.export_date,
      });

      const savedExport = await queryRunner.manager.save(exportRecord);

      let totalAmount = 0; // This can be used if we decide to return it, but not save to entity

      // Process each export item
      for (const item of createExportDto.items) {
        // Step 1: Allocate batches (this returns an array of { batchId, quantityToTakeFromBatch })
        const allocatedBatchSummaries = await this.allocateBatchesForIngredient(
          item.ingredientId,
          item.quantity,
        );

        if (allocatedBatchSummaries.length === 0) {
          throw new BadRequestException(
            `Không đủ lô hàng cho thành phần ${item.ingredientId}`,
          );
        }

        let remainingQuantityToExportForItem = item.quantity;

        // Step 2: Iterate through allocated batch summaries and process actual batches
        for (const allocation of allocatedBatchSummaries) {
          if (remainingQuantityToExportForItem <= 0) break;

          const actualBatch = await queryRunner.manager.findOne(Batch, {
            where: { id: allocation.batchId },
          });

          if (!actualBatch) {
            throw new NotFoundException(
              `Lô hàng với ID ${allocation.batchId} không tìm thấy trong quá trình xử lý xuất kho.`,
            );
          }

          const quantityFromThisBatch = Math.min(
            actualBatch.remaining_quantity, // Use actualBatch here
            allocation.quantity, // This is the quantity determined by allocateBatchesForIngredient for this batch
            remainingQuantityToExportForItem,
          );

          if (quantityFromThisBatch <= 0) continue; // Should not happen if allocateBatchesForIngredient is correct

          const exportItem = this.exportItemRepository.create({
            exportId: savedExport.id,
            batchId: actualBatch.id, // Use actualBatch.id
            ingredientId: item.ingredientId,
            quantity: quantityFromThisBatch,
          });

          await queryRunner.manager.save(exportItem);

          actualBatch.remaining_quantity -= quantityFromThisBatch;
          if (actualBatch.remaining_quantity < 0) {
            // This should ideally be caught by allocateBatchesForIngredient or earlier checks
            throw new Error('Số lượng còn lại của lô hàng không thể âm.');
          }
          if (actualBatch.remaining_quantity === 0) {
            actualBatch.status = BatchStatus.DEPLETED;
          }
          await queryRunner.manager.save(actualBatch); // Save changes to the actual batch

          totalAmount += quantityFromThisBatch * actualBatch.price; // Use actualBatch.price
          remainingQuantityToExportForItem -= quantityFromThisBatch;
        }

        if (remainingQuantityToExportForItem > 0) {
          // This indicates a mismatch between allocation logic and actual processing,
          // or an issue if allocateBatchesForIngredient didn't throw when it should have.
          throw new BadRequestException(
            `Không đủ số lượng cho thành phần ${item.ingredientId} sau khi phân bổ lô hàng. Yêu cầu: ${item.quantity}, còn lại: ${remainingQuantityToExportForItem}`,
          );
        }
      }

      await queryRunner.commitTransaction();
      // Fetch the complete export record with relations to return
      return this.findOne(savedExport.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Không thể tạo phiếu xuất kho');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(includeDeleted: boolean = false): Promise<IngredientExport[]> {
    return this.exportRepository.find({
      relations: ['items', 'items.ingredient', 'items.batch', 'created_by'],
      where: { deleted_at: includeDeleted ? undefined : IsNull() }, // Corrected: use IsNull()
      withDeleted: includeDeleted,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(
    id: string,
    includeDeleted: boolean = false,
  ): Promise<IngredientExport> {
    const exportRecord = await this.exportRepository.findOne({
      where: { id, deleted_at: includeDeleted ? undefined : IsNull() }, // Corrected: use IsNull()
      relations: ['items', 'items.ingredient', 'items.batch', 'created_by'],
      withDeleted: includeDeleted,
    });
    if (!exportRecord) {
      throw new BadRequestException('Không tìm thấy phiếu xuất kho');
    }

    return exportRecord;
  }

  async softDelete(id: string) {
    const exportRecord = await this.findOne(id);
    // exportRecord.deleted_at = new Date(); // TypeORM handles this with @DeleteDateColumn
    await this.exportRepository.softRemove(exportRecord); // Use softRemove for entities with @DeleteDateColumn
    return { message: 'Đã xóa phiếu xuất kho' };
  }
}
