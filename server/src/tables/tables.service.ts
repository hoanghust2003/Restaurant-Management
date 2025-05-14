import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
  ) {}
  async findAll(status?: TableStatus): Promise<TableEntity[]> {
    try {
      if (status) {
        this.logger.log(`Fetching tables with status: ${status}`);
        return this.tableRepository.find({ where: { status } });
      }
      this.logger.log('Fetching all tables');
      return this.tableRepository.find();
    } catch (error) {
      this.logger.error(`Error fetching tables: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<TableEntity> {
    try {
      this.logger.log(`Finding table by id: ${id}`);
      const table = await this.tableRepository.findOneBy({ id });
      
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
        this.logger.warn(`User with role ${userRole} attempted to delete table ${id}`);
        throw new ForbiddenException('Only administrators can delete tables');
      }
      
      this.logger.log(`Deleting table ${id}`);
      // Verify table exists before deletion
      await this.findOne(id);
      
      const result = await this.tableRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Table with ID ${id} not found`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error removing table ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }  async updateStatus(id: string, status: TableStatus, userRole: UserRole): Promise<TableEntity> {
    try {
      // Validate role for status updates
      if (![UserRole.ADMIN, UserRole.WAITER, UserRole.CASHIER].includes(userRole)) {
        this.logger.warn(`User with role ${userRole} attempted to update table status`);
        throw new ForbiddenException('Only admins, waiters, and cashiers can update table status');
      }
      
      this.logger.log(`Updating status of table ${id} to ${status}`);
      const table = await this.findOne(id);
      
      // Table existence is already checked in findOne method
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
}
