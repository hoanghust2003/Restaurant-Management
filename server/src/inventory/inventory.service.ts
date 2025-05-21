import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThanOrEqual, Between } from 'typeorm';
import { Ingredient } from '../entities/ingredient.entity';
import { Batch } from '../entities/batch.entity';
import { Supplier } from '../entities/supplier.entity';
import { IngredientImport } from '../entities/ingredient-import.entity';
import { IngredientExport } from '../entities/ingredient-export.entity';
import { ExportItem } from '../entities/export-item.entity';
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
          remaining_quantity: MoreThanOrEqual(0.001) // Only consider batches with remaining quantity
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
          expiry_date: LessThan(thirtyDaysFromNow.toISOString().split('T')[0]),
          remaining_quantity: MoreThanOrEqual(0.001)
        }
      });
      
      // Get total imports and exports for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const totalImports = await this.importRepository.count({
        where: {
          created_at: MoreThanOrEqual(startOfMonth)
        }
      });
      
      const totalExports = await this.exportRepository.count({
        where: {
          created_at: MoreThanOrEqual(startOfMonth)
        }
      });
      
      // Calculate total inventory value
      const batches = await this.batchRepository.find({
        where: {
          remaining_quantity: MoreThanOrEqual(0.001)
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
          expiry_date: LessThan(futureDate.toISOString().split('T')[0]),
          remaining_quantity: MoreThanOrEqual(0.001)
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
          remaining_quantity: MoreThanOrEqual(0.001)
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
      // Validate admin or manager role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
        throw new ForbiddenException('Only admin or manager can delete import records');
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
      // Validate admin or manager role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
        throw new ForbiddenException('Only admin or manager can restore import records');
      }
      
      // Check if import exists and is deleted
      const importItem = await this.importRepository.findOne({
        where: { id },
        withDeleted: true
      });
      
      if (!importItem) {
        throw new NotFoundException(`Import with ID ${id} not found`);
      }
      
      if (!importItem.deleted_at) {
        throw new ForbiddenException(`Import with ID ${id} is not deleted`);
      }
      
      // Restore the import
      await this.importRepository.restore(id);
      
      // Restore the batches
      await this.batchRepository.restore({
        importId: id
      });
      
      return await this.getImportById(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
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
        relations: ['created_by'],
        withDeleted: includeDeleted,
        order: {
          created_at: 'DESC'
        }
      });
      
      // For each export, get its items
      const exportsWithItems: any[] = [];
      
      for (const exportItem of exports) {
        const items = await this.exportItemRepository.find({
          where: {
            exportId: exportItem.id
          },
          relations: ['ingredient', 'batch']
        });
        
        exportsWithItems.push({
          ...exportItem,
          items
        });
      }
      
      return exportsWithItems;
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
      const exportItem = await this.exportRepository.findOne({
        where: { id },
        relations: ['created_by'],
        withDeleted: includeDeleted
      });
      
      if (!exportItem) {
        throw new NotFoundException(`Export with ID ${id} not found`);
      }
      
      const items = await this.exportItemRepository.find({
        where: {
          exportId: id
        },
        relations: ['ingredient', 'batch']
      });
      
      return {
        ...exportItem,
        items
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
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
    try {
      // Create the export
      const exportData = this.exportRepository.create({
        createdById: userId,
        reason: createExportDto.reason
      });
      
      const savedExport = await this.exportRepository.save(exportData);
      
      // Create export items and update batches
      const items: any[] = [];
      
      for (const itemDto of createExportDto.items) {
        // Check if batch exists
        const batch = await this.batchRepository.findOne({
          where: { id: itemDto.batchId }
        });
        
        if (!batch) {
          throw new NotFoundException(`Batch with ID ${itemDto.batchId} not found`);
        }
        
        // Check if ingredient exists and matches the batch
        const ingredient = await this.ingredientRepository.findOne({
          where: { id: itemDto.ingredientId }
        });
        
        if (!ingredient) {
          throw new NotFoundException(`Ingredient with ID ${itemDto.ingredientId} not found`);
        }
        
        if (batch.ingredientId !== itemDto.ingredientId) {
          throw new BadRequestException(`Batch ${itemDto.batchId} does not match ingredient ${itemDto.ingredientId}`);
        }
        
        // Check if there's enough quantity
        if (batch.remaining_quantity < itemDto.quantity) {
          throw new BadRequestException(`Not enough quantity in batch ${batch.name}. Available: ${batch.remaining_quantity}, Requested: ${itemDto.quantity}`);
        }
        
        // Create export item
        const exportItem = this.exportItemRepository.create({
          exportId: savedExport.id,
          batchId: itemDto.batchId,
          ingredientId: itemDto.ingredientId,
          quantity: itemDto.quantity
        });
        
        const savedItem = await this.exportItemRepository.save(exportItem);
        
        // Update batch remaining quantity
        batch.remaining_quantity -= itemDto.quantity;
        await this.batchRepository.save(batch);
        
        items.push({
          ...savedItem,
          batch,
          ingredient
        });
      }
      
      return {
        ...savedExport,
        items
      };
    } catch (error) {
      this.logger.error(`Error creating export: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Remove an export (soft delete)
   * @param id Export ID
   * @param userRole User role
   */
  async removeExport(id: string, userRole: UserRole) {
    try {
      // Validate admin or manager role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
        throw new ForbiddenException('Only admin or manager can delete export records');
      }
      
      // Check if export exists
      const exportItem = await this.exportRepository.findOne({
        where: { id }
      });
      
      if (!exportItem) {
        throw new NotFoundException(`Export with ID ${id} not found`);
      }
      
      // Get export items
      const items = await this.exportItemRepository.find({
        where: { exportId: id }
      });
      
      // Restore quantities to batches
      for (const item of items) {
        const batch = await this.batchRepository.findOne({
          where: { id: item.batchId }
        });
        
        if (batch) {
          batch.remaining_quantity += item.quantity;
          await this.batchRepository.save(batch);
        }
      }
      
      // Soft delete the export
      await this.exportRepository.softDelete(id);
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
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
      // Validate admin or manager role
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
        throw new ForbiddenException('Only admin or manager can restore export records');
      }
      
      // Check if export exists and is deleted
      const exportItem = await this.exportRepository.findOne({
        where: { id },
        withDeleted: true
      });
      
      if (!exportItem) {
        throw new NotFoundException(`Export with ID ${id} not found`);
      }
      
      if (!exportItem.deleted_at) {
        throw new ForbiddenException(`Export with ID ${id} is not deleted`);
      }
      
      // Get export items
      const items = await this.exportItemRepository.find({
        where: { exportId: id }
      });
      
      // Check if restoring is possible (all batches still exist)
      for (const item of items) {
        const batch = await this.batchRepository.findOne({
          where: { id: item.batchId }
        });
        
        if (!batch) {
          throw new ForbiddenException(`Cannot restore export with ID ${id} because batch with ID ${item.batchId} no longer exists`);
        }
      }
      
      // Update batches (reduce remaining quantity again)
      for (const item of items) {
        const batch = await this.batchRepository.findOne({
          where: { id: item.batchId }
        });
        
        // Before using batch, check for null
        if (!batch) {
          throw new NotFoundException('Batch not found');
        }
        if (batch.remaining_quantity < item.quantity) {
          throw new ForbiddenException(`Cannot restore export with ID ${id} because batch ${batch.name} does not have enough quantity`);
        }
        batch.remaining_quantity -= item.quantity;
        await this.batchRepository.save(batch);
      }
      
      // Restore the export
      await this.exportRepository.restore(id);
      
      return await this.getExportById(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
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
            remaining_quantity: MoreThanOrEqual(0.001)
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

  /**
   * Get import history for a date range
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   */
  async getImportHistory(startDate: string, endDate: string) {
    try {
      const start = startDate ? new Date(startDate) : new Date(0); // If no start date, use epoch
      const end = endDate ? new Date(endDate) : new Date(); // If no end date, use current date
      end.setHours(23, 59, 59, 999); // Set to end of day
      
      const imports = await this.importRepository.find({
        where: {
          created_at: Between(start, end)
        },
        relations: ['supplier', 'created_by'],
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
      this.logger.error(`Error getting import history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get export history for a date range
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   */
  async getExportHistory(startDate: string, endDate: string) {
    try {
      const start = startDate ? new Date(startDate) : new Date(0); // If no start date, use epoch
      const end = endDate ? new Date(endDate) : new Date(); // If no end date, use current date
      end.setHours(23, 59, 59, 999); // Set to end of day
      
      const exports = await this.exportRepository.find({
        where: {
          created_at: Between(start, end)
        },
        relations: ['created_by'],
        order: {
          created_at: 'DESC'
        }
      });
      
      // For each export, get its items
      const exportsWithItems: any[] = [];
      
      for (const exportItem of exports) {
        const items = await this.exportItemRepository.find({
          where: {
            exportId: exportItem.id
          },
          relations: ['ingredient', 'batch']
        });
        
        exportsWithItems.push({
          ...exportItem,
          items
        });
      }
      
      return exportsWithItems;
    } catch (error) {
      this.logger.error(`Error getting export history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get stock value report
   */
  async getStockValueReport() {
    try {
      // Get all active batches
      const batches = await this.batchRepository.find({
        where: {
          remaining_quantity: MoreThanOrEqual(0.001)
        },
        relations: ['ingredient']
      });
      
      // Group by ingredient
      const ingredientMap = {};
      let totalValue = 0;
      
      batches.forEach(batch => {
        if (!ingredientMap[batch.ingredientId]) {
          ingredientMap[batch.ingredientId] = {
            id: batch.ingredientId,
            name: batch.ingredient.name,
            unit: batch.ingredient.unit,
            total_quantity: 0,
            total_value: 0,
            batches: []
          };
        }
        
        const batchValue = batch.price * batch.remaining_quantity;
        
        ingredientMap[batch.ingredientId].total_quantity += batch.remaining_quantity;
        ingredientMap[batch.ingredientId].total_value += batchValue;
        ingredientMap[batch.ingredientId].batches.push({
          id: batch.id,
          name: batch.name,
          remaining_quantity: batch.remaining_quantity,
          price: batch.price,
          value: batchValue,
          expiry_date: batch.expiry_date
        });
        
        totalValue += batchValue;
      });
      
      return {
        ingredients: Object.values(ingredientMap),
        totalValue
      };
    } catch (error) {
      this.logger.error(`Error getting stock value report: ${error.message}`, error.stack);
      throw error;
    }
  }
}
