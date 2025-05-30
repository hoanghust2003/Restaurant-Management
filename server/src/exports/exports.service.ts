import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, IsNull } from 'typeorm';
import { IngredientExport } from '../entities/ingredient-export.entity';
import { ExportItem } from '../entities/export-item.entity';
import { Batch } from '../entities/batch.entity';
import { BatchStatus } from '../enums/batch-status.enum';
import { CreateExportDto } from '../inventory/dto/create-export.dto';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);

  constructor(
    @InjectRepository(IngredientExport)
    private readonly exportRepository: Repository<IngredientExport>,
    @InjectRepository(ExportItem)
    private readonly exportItemRepository: Repository<ExportItem>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    private readonly dataSource: DataSource,
  ) {}

  async createExport(createExportDto: CreateExportDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exportRecord = this.exportRepository.create({
        createdById: userId,
        reason: createExportDto.reason, // Assuming ExportReason enum values are compatible with string
        created_at: createExportDto.export_date,
        // reference_number from DTO is not on IngredientExport entity
        // description from DTO is not on IngredientExport entity
        // total_amount is calculated, not stored directly here
      });

      const savedExport = await queryRunner.manager.save(IngredientExport, exportRecord);
      let totalAmount = 0;

      // Process each export item
      for (const itemDto of createExportDto.items) {
        // TODO: Ensure itemDto has batchId, ingredientId, quantity
        // TODO: Add logic to fetch batch price or ingredient cost if needed for totalAmount calculation

        const availableQuantityInBatch = await this.batchRepository.findOne({
          where: { id: itemDto.batchId, ingredientId: itemDto.ingredientId }
        });

        if (!availableQuantityInBatch || availableQuantityInBatch.remaining_quantity < itemDto.quantity) {
          throw new Error(`Insufficient quantity in batch ${itemDto.batchId} for ingredient ${itemDto.ingredientId}`);
        }

        const exportItem = this.exportItemRepository.create({
          exportId: savedExport.id, // Assuming savedExport is a single entity
          batchId: itemDto.batchId,
          ingredientId: itemDto.ingredientId,
          quantity: itemDto.quantity,
          // price is not on ExportItem entity
        });
        await queryRunner.manager.save(ExportItem, exportItem);

        // Example: Calculate totalAmount if itemDto has price or can be derived
        // totalAmount += itemDto.quantity * (itemDto.price || availableQuantityInBatch.price);

        // Update batch remaining quantity
        availableQuantityInBatch.remaining_quantity -= itemDto.quantity;
        if (availableQuantityInBatch.remaining_quantity === 0) {
          // availableQuantityInBatch.status = BatchStatus.DEPLETED; // Assuming BatchStatus enum exists
        }
        await queryRunner.manager.save(Batch, availableQuantityInBatch);
      }

      // total_amount is not a field on IngredientExport entity.
      // If it needs to be stored, the entity and DB schema must be updated.
      // savedExport.total_amount = totalAmount; 
      // await queryRunner.manager.save(IngredientExport, savedExport);

      await queryRunner.commitTransaction();
      // Consider returning an object that includes totalAmount if needed by the client
      // e.g., return { ...savedExport, totalAmount }; (this would change the return type)
      return savedExport;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error creating export: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    try {
      const exports = await this.exportRepository.find({
        order: { created_at: 'DESC' }, // Changed exportDate to created_at
        relations: ['items', 'items.ingredient', 'items.batch']
      });
      return exports; // Added return statement
    } catch (error) {
      this.logger.error(`Error fetching all exports: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getExportsByDateRange(startDate: Date, endDate: Date) {
    try {
      const exports = await this.exportRepository.find({
        where: {
          created_at: Between(startDate, endDate), // Changed exportDate to created_at
          deleted_at: IsNull() // Assuming you only want non-deleted records
        },
        order: { created_at: 'DESC' }, // Changed exportDate to created_at
        relations: ['items', 'items.ingredient', 'items.batch', 'created_by']
      });
      return exports;
    } catch (error) {
      this.logger.error(`Error fetching exports by date range: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const exportRecord = await this.exportRepository.findOne({
        where: { id, deleted_at: IsNull() }, // Assuming you only want non-deleted records
        relations: ['items', 'items.ingredient', 'items.batch', 'created_by']
      });
      if (!exportRecord) {
        throw new NotFoundException(`Export with ID ${id} not found`);
      }
      return exportRecord;
    } catch (error) {
      this.logger.error(`Error fetching export ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
