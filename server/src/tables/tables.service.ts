import { Injectable, Logger, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEntity } from '../entities/table.entity';
import { CreateTableDto, UpdateTableDto } from './dto';
import { TableStatus } from '../enums/table-status.enum';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);

  constructor(
    @InjectRepository(TableEntity)
    private tableRepository: Repository<TableEntity>,
  ) {}  async findAll(status?: TableStatus, includeDeleted: boolean = false): Promise<TableEntity[]> {
    try {
      const queryOptions: any = {};
      
      if (status) {
        queryOptions.where = { status };
      }
      
      if (includeDeleted) {
        queryOptions.withDeleted = true;
      }
      
      this.logger.log(`Fetching tables with options: ${JSON.stringify(queryOptions)}`);
      return this.tableRepository.find(queryOptions);
    } catch (error) {
      this.logger.error(`Error fetching tables: ${error.message}`, error.stack);
      throw error;
    }
  }
  async findOne(id: string, includeDeleted: boolean = false): Promise<TableEntity> {
    try {
      this.logger.log(`Finding table by id: ${id}, includeDeleted: ${includeDeleted}`);
      const table = await this.tableRepository.findOne({
        where: { id },
        withDeleted: includeDeleted
      });
      
      if (!table) {
        this.logger.warn(`Table with ID ${id} not found`);
        throw new NotFoundException(`Table with ID ${id} not found`);
      }
      
      return table;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding table ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(createTableDto: CreateTableDto, userRole: UserRole): Promise<TableEntity> {
    try {
      // Validate admin role for table creation
      if (userRole !== UserRole.ADMIN) {
        this.logger.warn(`User with role ${userRole} attempted to create a table`);
        throw new ForbiddenException('Only administrators can create tables');
      }
      
      this.logger.log(`Creating new table: ${createTableDto.name}`);
      const table = this.tableRepository.create({
        ...createTableDto,
        status: TableStatus.AVAILABLE, // Default status for new tables
      });
      
      return await this.tableRepository.save(table);
    } catch (error) {
      this.logger.error(`Error creating table: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateTableDto: UpdateTableDto, userRole: UserRole): Promise<TableEntity> {
    try {
      // Validate admin role for table updates
      if (userRole !== UserRole.ADMIN) {
        this.logger.warn(`User with role ${userRole} attempted to update table ${id}`);
        throw new ForbiddenException('Only administrators can update table information');
      }
      
      this.logger.log(`Updating table ${id}`);
      const table = await this.findOne(id);
      
      this.tableRepository.merge(table, updateTableDto);
      return await this.tableRepository.save(table);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error updating table ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
  async remove(id: string, userRole: UserRole): Promise<boolean> {
    try {
      // Validate admin role for table deletion
      if (userRole !== UserRole.ADMIN) {
        throw new ForbiddenException('You do not have permission to delete tables.');
      }
      
      this.logger.log(`Soft-deleting table ${id}`);
      // Verify table exists before deletion
      await this.findOne(id);
      
      // Using soft delete instead of hard delete
      const result = await this.tableRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Table with ID ${id} not found for deletion.`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error soft-deleting table ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not delete table.');
    }
  }

  async updateStatus(id: string, status: TableStatus, userRole: UserRole): Promise<TableEntity> {
    try {
      // Validate user role for updating table status
      if (![UserRole.ADMIN, UserRole.STAFF].includes(userRole)) {
        throw new ForbiddenException('You do not have permission to update table status.');
      }

      this.logger.log(`Updating status for table ${id} to ${status} by user with role ${userRole}`);
      const table = await this.findOne(id);

      table.status = status;
      return await this.tableRepository.save(table);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error updating table status ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  async restore(id: string, userRole: UserRole): Promise<TableEntity> {
    try {
      // Validate admin role for table restoration
      if (userRole !== UserRole.ADMIN) {
        this.logger.warn(`User with role ${userRole} attempted to restore table ${id}`);
        throw new ForbiddenException('Only administrators can restore tables');
      }
      
      this.logger.log(`Restoring soft-deleted table ${id}`);
      // Verify table exists (including deleted ones)
      const table = await this.findOne(id, true);
      
      if (!table.deleted_at) {
        this.logger.warn(`Table ${id} is not deleted, cannot restore`);
        throw new ForbiddenException(`Table with ID ${id} is not deleted`);
      }
      
      // Restore the soft-deleted table
      await this.tableRepository.restore(id);
      
      // Return the restored table
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error restoring table ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
