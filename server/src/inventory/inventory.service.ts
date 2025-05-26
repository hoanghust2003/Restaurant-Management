import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';  
import { Repository, LessThan, MoreThan, Between, DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Ingredient } from '../entities/ingredient.entity';
import { Batch } from '../entities/batch.entity';
import { IngredientImport } from '../entities/ingredient-import.entity';
import { IngredientExport } from '../entities/ingredient-export.entity';
import { ExportItem } from '../entities/export-item.entity';
import { Supplier } from '../entities/supplier.entity';
import { BatchStatus } from '../enums/batch-status.enum';
import { CreateImportDto, CreateExportDto } from './dto';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(IngredientImport)
    private importRepository: Repository<IngredientImport>,
    @InjectRepository(IngredientExport)
    private exportRepository: Repository<IngredientExport>,
    @InjectRepository(ExportItem)
    private exportItemRepository: Repository<ExportItem>,
    private dataSource: DataSource
  ) {}

  /**
   * Get inventory statistics
   */
  async getInventoryStats() {
    try {
      // Count total ingredients
      const totalIngredients = await this.ingredientRepository.count();
      
      // Count total batches
      const totalBatches = await this.batchRepository.count({
        where: {
          remaining_quantity: MoreThan(0) // Only consider batches with remaining quantity
        }
      });
      
      // Count low stock ingredients
      const ingredients = await this.ingredientRepository.find();
      let lowStockCount = 0;
      
      for (const ingredient of ingredients) {
        const totalQuantity = await this.getTotalQuantityForIngredient(ingredient.id);
        if (totalQuantity < ingredient.threshold) {
          lowStockCount++;
        }
      }
      
      // Count batches expiring within 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const expiringBatches = await this.batchRepository.count({
        where: {
          expiry_date: LessThan(thirtyDaysFromNow),
          remaining_quantity: MoreThan(0)
        }
      });
      
      // Get total imports and exports for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const totalImports = await this.importRepository.count({
        where: {
          created_at: MoreThan(startOfMonth)
        }
      });
      
      const totalExports = await this.exportRepository.count({
        where: {
          created_at: MoreThan(startOfMonth)
        }
      });
      
      // Calculate total inventory value
      const batches = await this.batchRepository.find({
        where: {
          remaining_quantity: MoreThan(0)
        }
      });
      
      const totalValue = batches.reduce((sum, batch) => {
        return sum + (batch.price * batch.remaining_quantity);
      }, 0);
      
      return {
        totalIngredients,
        totalBatches,
        lowStockCount,
        expiringBatches,
        totalImports,
        totalExports,
        totalValue
      };
    } catch (error) {
      this.logger.error(`Error getting inventory stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get low stock items (ingredients with stock below threshold)
   */
  async getLowStockItems() {
    try {
      const ingredients = await this.ingredientRepository.find();
      const lowStockItems: any[] = [];
      
      for (const ingredient of ingredients) {
        const totalQuantity = await this.getTotalQuantityForIngredient(ingredient.id);
        
        if (totalQuantity < ingredient.threshold) {
          lowStockItems.push({
            id: ingredient.id,
            name: ingredient.name,
            unit: ingredient.unit,
            available_quantity: totalQuantity,
            min_quantity: ingredient.threshold,
            image_url: ingredient.image_url
          });
        }
      }
      
      return lowStockItems;
    } catch (error) {
      this.logger.error(`Error getting low stock items: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get items expiring soon
   * @param days Number of days to check for expiry
   */
  async getExpiringSoonItems(days: number = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const batches = await this.batchRepository.find({
        where: {
          expiry_date: LessThan(futureDate),
          remaining_quantity: MoreThan(0)
        },
        relations: ['ingredient']
      });
      // Group by ingredient and calculate total quantities
      const groupedBatches: any = {};
      
      batches.forEach(batch => {
        if (!groupedBatches[batch.ingredientId]) {
          groupedBatches[batch.ingredientId] = {
            ingredientId: batch.ingredientId,
            ingredientName: batch.ingredient.name,
            unit: batch.ingredient.unit,
            batches: []
          };
        }
        
        groupedBatches[batch.ingredientId].batches.push({
          id: batch.id,
          name: batch.name,
          remaining_quantity: batch.remaining_quantity,
          expiry_date: batch.expiry_date
        });
      });
      
      return Object.values(groupedBatches);
    } catch (error) {
      this.logger.error(`Error getting expiring soon items: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get total quantity for a specific ingredient across all batches
   * @param ingredientId Ingredient ID to check
   */
  async getTotalQuantityForIngredient(ingredientId: string): Promise<number> {
    try {
      const batches = await this.batchRepository.find({
        where: {
          ingredientId,
          remaining_quantity: MoreThan(0)
        }
      });
      
      return batches.reduce((sum, batch) => sum + batch.remaining_quantity, 0);
    } catch (error) {
      this.logger.error(`Error getting total quantity for ingredient ${ingredientId}: ${error.message}`, error.stack);
      return 0;
    }
  }

  /**
   * Get all imports
   * @param includeDeleted Whether to include soft-deleted imports
   */
  async getAllImports(includeDeleted: boolean = false) {
    try {
      const imports = await this.importRepository.find({
        relations: ['supplier', 'created_by'],
        withDeleted: includeDeleted,
        order: {
          created_at: 'DESC'
        }
      });
      
      // For each import, get its batches
      const importsWithBatches: any[] = [];
      
      for (const importItem of imports) {
        const batches = await this.batchRepository.find({
          where: {
            importId: importItem.id
          },
          relations: ['ingredient'],
          withDeleted: includeDeleted
        });
        
        importsWithBatches.push({
          ...importItem,
          batches,
          total_value: batches.reduce((sum, batch) => sum + (batch.price * batch.quantity), 0)
        });
      }
      
      return importsWithBatches;
    } catch (error) {
      this.logger.error(`Error getting all imports: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get import by ID
   * @param id Import ID
   * @param includeDeleted Whether to include soft-deleted imports
   */
  async getImportById(id: string, includeDeleted: boolean = false) {
    try {
      const importItem = await this.importRepository.findOne({
        where: { id },
        relations: ['supplier', 'created_by'],
        withDeleted: includeDeleted
      });
      
      if (!importItem) {
        throw new NotFoundException(`Import with ID ${id} not found`);
      }
      
      const batches = await this.batchRepository.find({
        where: {
          importId: id
        },
        relations: ['ingredient'],
        withDeleted: includeDeleted
      });
      
      return {
        ...importItem,
        batches,
        total_value: batches.reduce((sum, batch) => sum + (batch.price * batch.quantity), 0)
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error getting import ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new import with batches
   * @param createImportDto Import data
   * @param userId User ID of the creator
   */
  async createImport(createImportDto: CreateImportDto, userId: string) {
    try {
      // Check if supplier exists
      const supplier = await this.supplierRepository.findOne({
        where: { id: createImportDto.supplierId }
      });
      
      if (!supplier) {
        throw new NotFoundException(`Supplier with ID ${createImportDto.supplierId} not found`);
      }
      
      // Create the import
      const importData = this.importRepository.create({
        supplierId: createImportDto.supplierId,
        createdById: userId,
        note: createImportDto.note
      });
      
      const savedImport = await this.importRepository.save(importData);
      
      // Create batches
      const batches: Batch[] = [];
      
      for (const batchDto of createImportDto.batches) {
        // Check if ingredient exists
        const ingredient = await this.ingredientRepository.findOne({
          where: { id: batchDto.ingredientId }
        });
        
        if (!ingredient) {
          throw new NotFoundException(`Ingredient with ID ${batchDto.ingredientId} not found`);
        }
        
        const batch = this.batchRepository.create({
          importId: savedImport.id,
          ingredientId: batchDto.ingredientId,
          name: batchDto.name,
          quantity: batchDto.quantity,
          remaining_quantity: batchDto.quantity, // Initially, remaining = total
          expiry_date: batchDto.expiry_date,
          price: batchDto.price
        });
        
        const savedBatch = await this.batchRepository.save(batch);
        batches.push(savedBatch);
      }
      
      return {
        ...savedImport,
        batches,
        total_value: batches.reduce((sum, batch) => sum + (batch.price * batch.quantity), 0)
      };
    } catch (error) {
      this.logger.error(`Error creating import: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Remove an import (soft delete)
   * @param id Import ID
   * @param userRole User role
   */
  async removeImport(id: string, userRole: UserRole) {
    try {
      // Validate admin or warehouse role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        throw new ForbiddenException('Only admin or warehouse can perform this action');
      }
      
      // Check if import exists
      const importItem = await this.importRepository.findOne({
        where: { id }
      });
      
      if (!importItem) {
        throw new NotFoundException(`Import with ID ${id} not found`);
      }
      
      // Check if any batches from this import have been used
      const batches = await this.batchRepository.find({
        where: { importId: id }
      });
      
      for (const batch of batches) {
        if (batch.remaining_quantity < batch.quantity) {
          throw new ForbiddenException(`Cannot delete import with ID ${id} because some batches have already been used`);
        }
      }
      
      // Soft delete the batches first
      await this.batchRepository.softDelete({
        importId: id
      });
      
      // Soft delete the import
      await this.importRepository.softDelete(id);
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error removing import ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Restore a soft-deleted import
   * @param id Import ID
   * @param userRole User role
   */
  async restoreImport(id: string, userRole: UserRole) {
    try {
      // Validate admin or warehouse role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        throw new ForbiddenException('Only admin or warehouse can perform this action');
      }
      
      // Check if import exists and is deleted
      const importRecord = await this.importRepository.findOne({
        where: { id },
        withDeleted: true
      });
      
      if (!importRecord) {
        throw new NotFoundException(`Import with ID ${id} not found`);
      }
      
      if (!importRecord.deleted_at) {
        throw new BadRequestException(`Import with ID ${id} is not deleted`);
      }
      
      // Restore import and its batches
      await this.importRepository.restore(id);
      await this.batchRepository.restore({ importId: id });
      
      return importRecord;
    } catch (error) {
      this.logger.error(`Error restoring import ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all exports
   * @param includeDeleted Whether to include soft-deleted exports
   */
  async getAllExports(includeDeleted: boolean = false) {
    try {
      const exports = await this.exportRepository.find({
        relations: ['items', 'items.ingredient', 'items.batch'],
        withDeleted: includeDeleted,
        order: {
          created_at: 'DESC'
        }
      });

      return exports;
    } catch (error) {
      this.logger.error(`Error getting all exports: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get export by ID
   * @param id Export ID
   * @param includeDeleted Whether to include soft-deleted exports
   */
  async getExportById(id: string, includeDeleted: boolean = false) {
    try {
      const exportRecord = await this.exportRepository.findOne({
        where: { id },
        relations: ['items', 'items.ingredient', 'items.batch'],
        withDeleted: includeDeleted
      });

      if (!exportRecord) {
        throw new NotFoundException(`Export with ID ${id} not found`);
      }

      return exportRecord;
    } catch (error) {
      this.logger.error(`Error getting export ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a new export with items
   * @param createExportDto Export data
   * @param userId User ID of the creator
   */
  async createExport(createExportDto: CreateExportDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exportRecord = this.exportRepository.create({
        createdById: userId,
        created_at: createExportDto.export_date,
        reason: createExportDto.reason,
        // description: createExportDto.description, // Not in IngredientExport entity
        // reference_number: createExportDto.reference_number, // Not in entity by default
      });

      const savedExport = await queryRunner.manager.save(exportRecord);
      let totalAmount = 0;

      // Process each export item
      for (const itemDto of createExportDto.items) {
        const batch = await queryRunner.manager.findOne(Batch, {
          where: { id: itemDto.batchId }
        });

        if (!batch) {
          throw new NotFoundException(`Batch with ID ${itemDto.batchId} not found`);
        }

        if (batch.remaining_quantity < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient quantity in batch ${batch.name}. Available: ${batch.remaining_quantity}, Requested: ${itemDto.quantity}`
          );
        }

        const exportItem = this.exportItemRepository.create({
          exportId: savedExport.id,
          batchId: itemDto.batchId,
          ingredientId: itemDto.ingredientId,
          quantity: itemDto.quantity,
          // price: batch.price, // Not in ExportItem entity
        });

        await queryRunner.manager.save(exportItem);
        
        // Update batch quantities
        batch.remaining_quantity -= itemDto.quantity;
        await queryRunner.manager.save(batch);

        totalAmount += itemDto.quantity * batch.price;
      }

      // total_amount is not a field on IngredientExport entity.
      // If it needs to be returned, it can be part of the response object:
      // return { ...savedExport, total_amount: totalAmount };
      // For now, just committing the transaction and returning the saved export.
      await queryRunner.commitTransaction();

      // Fetch the saved export with its items to return a complete object
      const result = await this.exportRepository.findOne({
        where: { id: savedExport.id },
        relations: ['items', 'items.ingredient', 'items.batch', 'created_by'],
      });
      return result;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error creating export: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Remove an export (soft delete)
   * @param id Export ID
   * @param userRole User role
   */
  async removeExport(id: string, userRole: UserRole) {
    try {
      // Validate admin or warehouse role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        throw new ForbiddenException('Only admin or warehouse can delete export records');
      }
      
      // Check if export exists
      const exportRecord = await this.exportRepository.findOne({
        where: { id },
        relations: ['items', 'items.batch']
      });
      
      if (!exportRecord) {
        throw new NotFoundException(`Export with ID ${id} not found`);
      }
      
      // Return quantities to batches
      for (const item of exportRecord.items) {
        const batch = item.batch;
        if (batch) {
          batch.remaining_quantity += item.quantity;
          await this.batchRepository.save(batch);
        }
      }
      
      // Soft delete export and items
      await this.exportRepository.softDelete(id);
      await this.exportItemRepository.softDelete({ exportId: id });

      return true;
    } catch (error) {
      this.logger.error(`Error removing export ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Restore a soft-deleted export
   * @param id Export ID
   * @param userRole User role
   */
  async restoreExport(id: string, userRole: UserRole) {
    try {
      // Validate admin or warehouse role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.WAREHOUSE) {
        throw new ForbiddenException('Only admin or warehouse can restore export records');
      }
      
      // Check if export exists and is deleted
      const exportRecord = await this.exportRepository.findOne({
        where: { id },
        withDeleted: true
      });
      
      if (!exportRecord) {
        throw new NotFoundException(`Export with ID ${id} not found`);
      }
      
      if (!exportRecord.deleted_at) {
        throw new BadRequestException(`Export with ID ${id} is not deleted`);
      }
      
      const items = await this.exportItemRepository.find({
        where: { exportId: id },
        withDeleted: true,
        relations: ['batch']
      });

      // Check if we can restore quantities
      for (const item of items) {
        if (!item.batch || item.batch.remaining_quantity < item.quantity) {
          throw new BadRequestException(
            `Cannot restore export: insufficient quantity in batch ${item.batch?.name || 'unknown'}`
          );
        }
      }

      // Restore export and items, update batch quantities
      await this.exportRepository.restore(id);
      await this.exportItemRepository.restore({ exportId: id });

      for (const item of items) {
        const batch = item.batch;
        if (batch) {
          batch.remaining_quantity -= item.quantity;
          await this.batchRepository.save(batch);
        }
      }

      return exportRecord;
    } catch (error) {
      this.logger.error(`Error restoring export ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all batches
   * @param includeDeleted Whether to include soft-deleted batches
   */
  async getAllBatches(includeDeleted: boolean = false) {
    try {
      return await this.batchRepository.find({
        relations: ['ingredient', 'import', 'import.supplier'],
        withDeleted: includeDeleted,
        order: {
          created_at: 'DESC'
        }
      });
    } catch (error) {
      this.logger.error(`Error getting all batches: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get batch by ID
   * @param id Batch ID
   * @param includeDeleted Whether to include soft-deleted batches
   */
  async getBatchById(id: string, includeDeleted: boolean = false) {
    try {
      const batch = await this.batchRepository.findOne({
        where: { id },
        relations: ['ingredient', 'import', 'import.supplier'],
        withDeleted: includeDeleted
      });
      
      if (!batch) {
        throw new NotFoundException(`Batch with ID ${id} not found`);
      }
      
      return batch;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error getting batch ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get current stock levels for all ingredients
   */
  async getIngredientStock() {
    try {
      const ingredients = await this.ingredientRepository.find();
      const result: any[] = [];
      
      for (const ingredient of ingredients) {
        const batches = await this.batchRepository.find({
          where: {
            ingredientId: ingredient.id,
            remaining_quantity: MoreThan(0)
          },
          order: {
            expiry_date: 'ASC' // Sort by expiry date to show earliest expiring first
          }
        });
        
        const totalQuantity = batches.reduce((sum, batch) => sum + batch.remaining_quantity, 0);
        
        result.push({
          id: ingredient.id,
          name: ingredient.name,
          unit: ingredient.unit,
          total_quantity: totalQuantity,
          threshold: ingredient.threshold,
          status: totalQuantity < ingredient.threshold ? 'low' : 'ok',
          batches: batches.map(b => ({
            id: b.id,
            name: b.name,
            remaining_quantity: b.remaining_quantity,
            expiry_date: b.expiry_date
          }))
        });
      }
        return result;
    } catch (error) {
      this.logger.error(`Error getting ingredient stock: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getImportHistory(startDate: Date, endDate: Date) {
    try {
      return this.importRepository.find({
        where: {
          created_at: Between(startDate, endDate)
        },
        relations: ['supplier', 'batches', 'batches.ingredient'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error getting import history: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getExportHistory(startDate: Date, endDate: Date) {
    try {
      return this.exportRepository.find({
        where: {
          created_at: Between(startDate, endDate)
        },
        relations: ['items', 'items.ingredient', 'items.batch'],
        order: { created_at: 'DESC' }
      });
    } catch (error) {
      this.logger.error(`Error getting export history: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStockValue() {
    try {
      const batches = await this.batchRepository.find({
        where: {
          remaining_quantity: MoreThan(0)
        },
        relations: ['ingredient']
      });

      const ingredientValues = new Map<string, {
        ingredientId: string;
        name: string;
        unit: string;
        totalQuantity: number;
        totalValue: number;
        batches: any[];
      }>();

      batches.forEach(batch => {
        const value = batch.remaining_quantity * batch.price;
        const existing = ingredientValues.get(batch.ingredientId) || {
          ingredientId: batch.ingredientId,
          name: batch.ingredient.name,
          unit: batch.ingredient.unit,
          totalQuantity: 0,
          totalValue: 0,
          batches: []
        };

        existing.totalQuantity += batch.remaining_quantity;
        existing.totalValue += value;
        existing.batches.push({
          id: batch.id,
          name: batch.name,
          remaining_quantity: batch.remaining_quantity,
          price: batch.price,
          value: value,
          expiry_date: batch.expiry_date
        });

        ingredientValues.set(batch.ingredientId, existing);
      });

      const totalValue = Array.from(ingredientValues.values()).reduce(
        (sum, item) => sum + item.totalValue,
        0
      );

      return {
        total_value: totalValue,
        ingredients: Array.from(ingredientValues.values())
      };
    } catch (error) {
      this.logger.error(`Error calculating stock value: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Calculate inventory costs for a period
   * @param startDate Start date of period
   * @param endDate End date of period
   */
  async calculateInventoryCosts(startDate: Date, endDate: Date) {
    try {
      // Get all imports in period
      const imports = await this.importRepository.find({
        where: {
          created_at: Between(startDate, endDate)
        },
        relations: ['batches']
      });

      // Calculate total import cost
      const importCost = imports.reduce((total, imp) => {
        const batchCosts = imp.batches.reduce(
          (batchTotal, batch) => batchTotal + (batch.price * batch.quantity),
          0
        );
        return total + batchCosts;
      }, 0);

      // Get all exports in period
      const exports = await this.exportRepository.find({
        where: { 
          created_at: Between(startDate, endDate)
        },
        relations: ['items', 'items.batch']
      });

      // Calculate total export cost (based on batch prices)
      const exportCost = exports.reduce((total, exp) => {
        const itemCosts = exp.items.reduce(
          (itemTotal, item) => itemTotal + (item.batch.price * item.quantity),
          0
        );
        return total + itemCosts;
      }, 0);

      // Calculate current inventory value
      const currentValue = await this.getStockValue();

      return {
        period: {
          start: startDate,
          end: endDate
        },
        costs: {
          import_cost: importCost,
          export_cost: exportCost,
          current_stock_value: currentValue.total_value
        }
      };
    } catch (error) {
      this.logger.error(`Error calculating inventory costs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Scheduled stock check
   * @cron 0 0 * * * - Runs at midnight everyday
   */
  @Cron('0 0 * * *') // Run at midnight everyday
  async scheduleStockCheck() {
    try {
      this.logger.log('Running scheduled stock check...');

      // Get all ingredients
      const ingredients = await this.ingredientRepository.find();
      
      // Check stock level for each ingredient
      for (const ingredient of ingredients) {
        const totalQuantity = await this.getTotalQuantityForIngredient(ingredient.id);
        
        // If below threshold, create notification
        if (totalQuantity < ingredient.threshold) {
          // TODO: Integrate with notification service
          this.logger.warn(`Low stock alert: ${ingredient.name} (${totalQuantity} ${ingredient.unit})`);
        }
      }

      // Check for expiring batches (within next 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      
      const expiringBatches = await this.batchRepository.find({
        where: {
          expiry_date: LessThan(sevenDaysFromNow),
          remaining_quantity: MoreThan(0)
        },
        relations: ['ingredient']
      });

      // Create expiry notifications
      for (const batch of expiringBatches) {
        // TODO: Integrate with notification service
        this.logger.warn(
          `Expiring batch alert: ${batch.ingredient.name} - Batch ${batch.name} ` +
          `expires on ${batch.expiry_date.toLocaleDateString()}`
        );
      }

      this.logger.log('Stock check completed');
    } catch (error) {
      this.logger.error(`Error in scheduled stock check: ${error.message}`, error.stack);
    }
  }

  /**
   * Get recent imports
   * @param limit Maximum number of imports to return
   */
  async getRecentImports(limit: number = 5) {
    try {
      const imports = await this.importRepository.find({
        relations: ['supplier', 'created_by'],
        order: {
          created_at: 'DESC'
        },
        take: limit
      });
      
      // For each import, get its batches
      const importsWithBatches: any[] = [];
      
      for (const importItem of imports) {
        const batches = await this.batchRepository.find({
          where: {
            importId: importItem.id
          },
          relations: ['ingredient']
        });
        
        importsWithBatches.push({
          ...importItem,
          batches,
          total_value: batches.reduce((sum, batch) => sum + (batch.price * batch.quantity), 0)
        });
      }
      
      return importsWithBatches;
    } catch (error) {
      this.logger.error(`Error getting recent imports: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get recent exports
   * @param limit Maximum number of exports to return
   */
  async getRecentExports(limit: number = 5) {
    try {
      const exports = await this.exportRepository.find({
        relations: ['items', 'items.ingredient', 'items.batch'],
        order: {
          created_at: 'DESC'
        },
        take: limit
      });

      return exports;
    } catch (error) {
      this.logger.error(`Error getting recent exports: ${error.message}`, error.stack);
      throw error;
    }
  }
}
