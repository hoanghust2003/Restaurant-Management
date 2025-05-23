import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { IngredientImport } from '../entities/ingredient-import.entity'; // Corrected path
import { Batch } from '../entities/batch.entity'; // Corrected path
import { CreateImportDto } from './dto/create-import.dto'; // Assuming DTO path
import { User } from '../entities/user.entity'; // Assuming User entity path
import { Supplier } from '../entities/supplier.entity'; // Assuming Supplier entity path

@Injectable()
export class IngredientImportsService {
  constructor(
    @InjectRepository(IngredientImport)
    private readonly importRepository: Repository<IngredientImport>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createImportDto: CreateImportDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create import record
      const importRecord = this.importRepository.create({
        createdById: userId, // Corrected field name
        supplierId: createImportDto.supplier_id, // Corrected field name
        note: createImportDto.note,
        // total_amount: createImportDto.total_amount, // If total_amount is on DTO and entity
      });

      await queryRunner.manager.save(IngredientImport, importRecord); // Pass entity class

      // Create batches
      const batches = createImportDto.batches.map(batchDto => {
        const batch = new Batch(); // It's better to use repository.create for consistency
        // batch.importId = importRecord.id; // Link to the saved import record
        // batch.ingredientId = batchDto.ingredient_id;
        // batch.name = batchDto.name; // Or generate name
        // batch.quantity = batchDto.quantity;
        // batch.remaining_quantity = batchDto.quantity;
        // batch.expiry_date = batchDto.expiry_date;
        // batch.price = batchDto.price;
        // batch.status = BatchStatus.AVAILABLE; // Set initial status
        // return batch;
        return this.batchRepository.create({
          importId: importRecord.id,
          ingredientId: batchDto.ingredient_id,
          name: batchDto.name, // Consider a naming convention
          quantity: batchDto.quantity,
          remaining_quantity: batchDto.quantity,
          expiry_date: batchDto.expiry_date,
          price: batchDto.price,
          // status: BatchStatus.AVAILABLE, // Default is set in entity
        });
      });

      await queryRunner.manager.save(Batch, batches); // Pass entity class
      await queryRunner.commitTransaction();

      return {
        ...importRecord,
        batches,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Không thể tạo phiếu nhập kho');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(includeDeleted: boolean = false) { // Added includeDeleted parameter for consistency
    return this.importRepository.find({
      where: { deleted_at: includeDeleted ? undefined : IsNull() }, // Corrected to use IsNull()
      relations: ['batches', 'supplier', 'created_by'],
      order: { created_at: 'DESC' },
      withDeleted: includeDeleted, // Added for consistency
    });
  }

  async findOne(id: string, includeDeleted: boolean = false) { // Added includeDeleted parameter
    const importRecord = await this.importRepository.findOne({
      where: { id, deleted_at: includeDeleted ? undefined : IsNull() }, // Corrected to use IsNull()
      relations: ['batches', 'supplier', 'created_by'],
      withDeleted: includeDeleted, // Added for consistency
    });

    if (!importRecord) {
      throw new BadRequestException('Không tìm thấy phiếu nhập kho');
    }

    return importRecord;
  }

  async softDelete(id: string) {
    const importRecord = await this.findOne(id);
    // importRecord.deleted_at = new Date(); // Not needed if using softRemove or if @DeleteDateColumn is present
    // await this.importRepository.save(importRecord);
    await this.importRepository.softRemove(importRecord);


    // Also soft delete all associated batches
    await this.batchRepository.update(
      { importId: id }, // Corrected field name
      { deleted_at: new Date() } // This is a direct update, softRemove is for entities
    );

    return { message: 'Đã xóa phiếu nhập kho' };
  }
}
