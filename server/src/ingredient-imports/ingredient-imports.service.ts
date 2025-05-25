import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { IngredientImport } from '../entities/ingredient-import.entity';
import { Batch } from '../entities/batch.entity';
import { CreateImportDto } from './dto/create-import.dto';
import { User } from '../entities/user.entity';
import { Supplier } from '../entities/supplier.entity';
import { BatchStatus } from '../enums/batch-status.enum';

@Injectable()
export class IngredientImportsService {
  constructor(
    @InjectRepository(IngredientImport)
    private readonly importRepository: Repository<IngredientImport>,
    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(includeDeleted = false) {
    return this.importRepository.find({
      where: { deleted_at: includeDeleted ? undefined : IsNull() },
      relations: ['batches', 'supplier', 'created_by'],
    });
  }

  async findOne(id: string, includeDeleted = false) {
    const importRecord = await this.importRepository.findOne({
      where: { 
        id,
        deleted_at: includeDeleted ? undefined : IsNull() 
      },
      relations: ['batches', 'supplier', 'created_by'],
    });

    if (!importRecord) {
      throw new NotFoundException('Import record not found');
    }

    return importRecord;
  }

  async create(userId: string, createImportDto: CreateImportDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const importRecord = await queryRunner.manager.save(IngredientImport, {
        createdById: userId,
        supplierId: createImportDto.supplier_id,
        note: createImportDto.note,
      });

      const batches = await Promise.all(
        createImportDto.batches.map(async (batchDto) => {
          const batch = await queryRunner.manager.save(Batch, {
            importId: importRecord.id,
            ingredientId: batchDto.ingredient_id,
            name: batchDto.name,
            quantity: batchDto.quantity,
            remaining_quantity: batchDto.quantity,
            expiry_date: batchDto.expiry_date,
            price: batchDto.price,
            status: BatchStatus.AVAILABLE
          });
          return batch;
        })
      );

      await queryRunner.commitTransaction();
      
      return { importRecord, batches };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to create import record');
    } finally {
      await queryRunner.release();
    }
  }

  async softDelete(id: string) {
    const importRecord = await this.findOne(id);
    
    if (!importRecord) {
      throw new NotFoundException('Import record not found');
    }

    await this.importRepository.softDelete(id);
    await this.batchRepository.update(
      { importId: id },
      { deleted_at: new Date() }
    );

    return { message: 'Import record and associated batches soft deleted' };
  }
}
