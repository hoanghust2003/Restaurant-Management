import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from '../entities/batch.entity';
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

  async findAll(includeDeleted: boolean = false): Promise<Batch[]> {
    try {
      this.logger.log('Getting all batches');
      
      const queryBuilder = this.batchRepository.createQueryBuilder('batch')
        .leftJoinAndSelect('batch.ingredient', 'ingredient')
        .leftJoinAndSelect('batch.import', 'import');

      if (!includeDeleted) {
        queryBuilder.where('batch.deleted_at IS NULL');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Error getting all batches: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string, includeDeleted: boolean = false): Promise<Batch> {
    try {
      this.logger.log(`Getting batch with id ${id}`);
      
      const queryBuilder = this.batchRepository.createQueryBuilder('batch')
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

      return batch;
    } catch (error) {
      this.logger.error(`Error getting batch ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(createBatchDto: CreateBatchDto, userRole: UserRole): Promise<Batch> {
    try {
      // Check permission
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to create a batch`);
        throw new BadRequestException('Only admin, manager or warehouse managers can create batches');
      }

      // Check if ingredient exists
      const ingredient = await this.ingredientRepository.findOne({ 
        where: { id: createBatchDto.ingredientId, deleted_at: undefined } 
      });
      
      if (!ingredient) {
        throw new NotFoundException(`Ingredient with id ${createBatchDto.ingredientId} not found`);
      }

      // Check if import exists
      const importRecord = await this.importRepository.findOne({ 
        where: { id: createBatchDto.importId } 
      });
      
      if (!importRecord) {
        throw new NotFoundException(`Import with id ${createBatchDto.importId} not found`);
      }

      this.logger.log(`Creating new batch for ingredient ${ingredient.name}`);
      const batch = this.batchRepository.create(createBatchDto);
      
      return await this.batchRepository.save(batch);
    } catch (error) {
      this.logger.error(`Error creating batch: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateBatchDto: UpdateBatchDto, userRole: UserRole): Promise<Batch> {
    try {
      // Check permission
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to update batch ${id}`);
        throw new BadRequestException('Only admin, manager or warehouse managers can update batches');
      }

      // Check if batch exists
      const batch = await this.findOne(id);
      
      // Cannot update the import ID or ingredient ID after creation
      if (updateBatchDto.importId && updateBatchDto.importId !== batch.importId) {
        throw new BadRequestException('Cannot update the import ID of a batch');
      }

      if (updateBatchDto.ingredientId && updateBatchDto.ingredientId !== batch.ingredientId) {
        throw new BadRequestException('Cannot update the ingredient ID of a batch');
      }

      this.logger.log(`Updating batch ${id}`);
      this.batchRepository.merge(batch, updateBatchDto);
      
      return await this.batchRepository.save(batch);
    } catch (error) {
      this.logger.error(`Error updating batch ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async softDelete(id: string, userRole: UserRole): Promise<boolean> {
    try {
      // Check permission
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to delete batch ${id}`);
        throw new BadRequestException('Only admin, manager or warehouse managers can delete batches');
      }

      // Check if batch exists
      await this.findOne(id);

      this.logger.log(`Soft deleting batch ${id}`);
      const result = await this.batchRepository.softDelete(id);
      
      return result.affected !== undefined && result.affected > 0;
    } catch (error) {
      this.logger.error(`Error deleting batch ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async restore(id: string, userRole: UserRole): Promise<Batch> {
    try {
      // Check permission
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to restore batch ${id}`);
        throw new BadRequestException('Only admin, manager or warehouse managers can restore batches');
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
      this.logger.error(`Error restoring batch ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getExpiringBatches(daysThreshold: number = 7): Promise<Batch[]> {
    try {
      const today = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(today.getDate() + daysThreshold);
      
      this.logger.log(`Getting batches expiring in the next ${daysThreshold} days`);
      
      return await this.batchRepository.createQueryBuilder('batch')
        .leftJoinAndSelect('batch.ingredient', 'ingredient')
        .where('batch.deleted_at IS NULL')
        .andWhere('batch.expiry_date <= :thresholdDate', { thresholdDate: thresholdDate.toISOString().split('T')[0] })
        .andWhere('batch.expiry_date >= :today', { today: today.toISOString().split('T')[0] })
        .andWhere('batch.remaining_quantity > 0')
        .getMany();
    } catch (error) {
      this.logger.error(`Error getting expiring batches: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getExpiredBatches(): Promise<Batch[]> {
    try {
      const today = new Date();
      
      this.logger.log('Getting expired batches');
      
      return await this.batchRepository.createQueryBuilder('batch')
        .leftJoinAndSelect('batch.ingredient', 'ingredient')
        .where('batch.deleted_at IS NULL')
        .andWhere('batch.expiry_date < :today', { today: today.toISOString().split('T')[0] })
        .andWhere('batch.remaining_quantity > 0')
        .getMany();
    } catch (error) {
      this.logger.error(`Error getting expired batches: ${error.message}`, error.stack);
      throw error;
    }
  }
}
