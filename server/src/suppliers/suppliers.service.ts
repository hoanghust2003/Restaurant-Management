import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  /**
   * Lấy tất cả nhà cung cấp
   * @param includeDeleted nếu true, bao gồm cả nhà cung cấp đã xóa mềm
   */
  async findAll(includeDeleted: boolean = false): Promise<Supplier[]> {
    try {
      this.logger.log(`Fetching all suppliers, includeDeleted=${includeDeleted}`);
      if (includeDeleted) {
        return this.supplierRepository.find({
          withDeleted: true
        });
      }
      return this.supplierRepository.find();
    } catch (error) {
      this.logger.error(`Error fetching suppliers: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Lấy thông tin một nhà cung cấp theo id
   * @param id ID của nhà cung cấp
   * @param includeDeleted nếu true, tìm cả trong những nhà cung cấp đã xóa mềm
   */
  async findOne(id: string, includeDeleted: boolean = false): Promise<Supplier> {
    try {
      this.logger.log(`Finding supplier by id: ${id}, includeDeleted=${includeDeleted}`);
      const supplier = await this.supplierRepository.findOne({
        where: { id },
        withDeleted: includeDeleted
      });
      
      if (!supplier) {
        this.logger.warn(`Supplier with ID ${id} not found`);
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }
      
      return supplier;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding supplier ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Tạo mới nhà cung cấp
   */
  async create(createSupplierDto: CreateSupplierDto, userRole: UserRole): Promise<Supplier> {
    try {
      // Validate admin, manager or warehouse role for supplier creation
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to create a supplier`);
        throw new ForbiddenException('Chỉ admin, quản lý hoặc nhân viên kho mới có thể tạo nhà cung cấp');
      }
      
      this.logger.log(`Creating new supplier: ${createSupplierDto.name}`);
      const supplier = this.supplierRepository.create(createSupplierDto);
      
      return await this.supplierRepository.save(supplier);
    } catch (error) {
      this.logger.error(`Error creating supplier: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin nhà cung cấp
   */
  async update(id: string, updateSupplierDto: UpdateSupplierDto, userRole: UserRole): Promise<Supplier> {
    try {
      // Validate admin, manager or warehouse role for supplier updates
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to update supplier ${id}`);
        throw new ForbiddenException('Chỉ admin, quản lý hoặc nhân viên kho mới có thể cập nhật thông tin nhà cung cấp');
      }
      
      this.logger.log(`Updating supplier ${id}`);
      const supplier = await this.findOne(id);
      
      this.supplierRepository.merge(supplier, updateSupplierDto);
      return await this.supplierRepository.save(supplier);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error updating supplier ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Xóa mềm một nhà cung cấp
   */
  async remove(id: string, userRole: UserRole): Promise<boolean> {
    try {
      // Validate admin, manager or warehouse role for supplier deletion
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to delete supplier ${id}`);
        throw new ForbiddenException('Chỉ admin, quản lý hoặc nhân viên kho mới có thể xóa nhà cung cấp');
      }
      
      this.logger.log(`Soft-deleting supplier ${id}`);
      // Verify supplier exists before deletion
      await this.findOne(id);
      
      // Using soft delete instead of hard delete
      const result = await this.supplierRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Supplier with ID ${id} not found`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error soft-deleting supplier ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Khôi phục một nhà cung cấp đã xóa mềm
   */
  async restore(id: string, userRole: UserRole): Promise<Supplier> {
    try {
      // Validate admin, manager or warehouse role for supplier restoration
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.WAREHOUSE) {
        this.logger.warn(`User with role ${userRole} attempted to restore supplier ${id}`);
        throw new ForbiddenException('Chỉ admin, quản lý hoặc nhân viên kho mới có thể khôi phục nhà cung cấp');
      }
      
      this.logger.log(`Restoring soft-deleted supplier ${id}`);
      // Verify supplier exists (including deleted ones)
      const supplier = await this.findOne(id, true);
      
      if (!supplier.deleted_at) {
        this.logger.warn(`Supplier ${id} is not deleted, cannot restore`);
        throw new ForbiddenException(`Nhà cung cấp với ID ${id} không bị xóa`);
      }
      
      // Restore the soft-deleted supplier
      await this.supplierRepository.restore(id);
      
      // Return the restored supplier
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error restoring supplier ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
