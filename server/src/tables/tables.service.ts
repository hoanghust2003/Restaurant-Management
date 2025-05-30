import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { TableEntity } from '../entities/table.entity';
import { CreateTableDto, UpdateTableDto, QrCodeResponseDto } from './dto';
import { TableStatus } from '../enums/table-status.enum';
import { UserRole } from '../enums/user-role.enum';

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);

  constructor(
    @InjectRepository(TableEntity)
    private tableRepository: Repository<TableEntity>,
    private configService: ConfigService,
  ) {}

  async findAll(status?: TableStatus, includeDeleted: boolean = false): Promise<TableEntity[]> {
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
        this.logger.warn(`Table with id ${id} not found`);
        throw new NotFoundException('Table not found');
      }
      
      return table;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error finding table by id ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async create(createTableDto: CreateTableDto, userRole?: UserRole): Promise<TableEntity> {
    try {
      this.logger.log(`Creating table with data: ${JSON.stringify(createTableDto)}`);
      const table = this.tableRepository.create(createTableDto);
      const savedTable = await this.tableRepository.save(table);
      this.logger.log(`Table created successfully with id: ${savedTable.id}`);
      return savedTable;
    } catch (error) {
      this.logger.error(`Error creating table: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateTableDto: UpdateTableDto, userRole: UserRole): Promise<TableEntity> {
    try {
      this.logger.log(`Updating table ${id} with data: ${JSON.stringify(updateTableDto)}`);
      
      if (!userRole) {
        throw new ForbiddenException('User role is required for this operation');
      }

      if (![UserRole.ADMIN, UserRole.STAFF].includes(userRole)) {
        throw new ForbiddenException('Insufficient permissions to update table');
      }

      const table = await this.findOne(id);
      
      // If status is being updated, only allow certain transitions
      if (updateTableDto.status) {
        if (!this.isValidStatusTransition(table.status, updateTableDto.status, userRole)) {
          throw new BadRequestException('Invalid table status transition');
        }
      }
      
      Object.assign(table, updateTableDto);
      const updatedTable = await this.tableRepository.save(table);
      this.logger.log(`Table ${id} updated successfully`);
      return updatedTable;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating table ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string, userRole?: UserRole): Promise<void> {
    try {
      this.logger.log(`Removing table with id: ${id}`);
      const table = await this.findOne(id);
      await this.tableRepository.softDelete(id);
      this.logger.log(`Table ${id} removed successfully`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing table ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async restore(id: string, userRole?: UserRole): Promise<TableEntity> {
    try {
      this.logger.log(`Restoring table with id: ${id}`);
      const table = await this.findOne(id, true);
      
      if (!table.deleted_at) {
        this.logger.warn(`Table ${id} is not deleted`);
        throw new ForbiddenException('Table is not deleted');
      }
      
      await this.tableRepository.restore(id);
      const restoredTable = await this.findOne(id);
      this.logger.log(`Table ${id} restored successfully`);
      return restoredTable;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error restoring table ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByUser(userId: string, userRole: UserRole): Promise<TableEntity[]> {
    try {
      this.logger.log(`Finding tables for user ${userId} with role ${userRole}`);
      
      // For now, return all tables as we don't have user-table assignments
      // In the future, you might want to implement table assignments
      if (userRole === UserRole.STAFF) {
        // Could filter by assigned waiter
        return this.findAll();
      }
      
      return this.findAll();
    } catch (error) {
      this.logger.error(`Error finding tables for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateStatus(id: string, status: TableStatus, userRole?: UserRole): Promise<TableEntity> {
    try {
      this.logger.log(`Updating table ${id} status to ${status}`);
      
      // Validate user role
      if (!userRole) {
        this.logger.warn(`Attempted to update table ${id} status without a user role`);
        throw new ForbiddenException('User role is required to update table status');
      }

      // Only admin and staff can update table status
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.STAFF) {
        this.logger.warn(`User with role ${userRole} attempted to update table ${id} status`);
        throw new ForbiddenException('Only admin or staff can update table status');
      }

      // Find and validate table exists
      const table = await this.findOne(id);
      if (!table) {
        throw new NotFoundException(`Table with ID ${id} not found`);
      }

      // Validate status enum value
      if (!Object.values(TableStatus).includes(status)) {
        this.logger.warn(`Invalid status value attempted: ${status}`);
        throw new BadRequestException(`Invalid table status: ${status}`);
      }

      // Update status
      table.status = status;
      const updatedTable = await this.tableRepository.save(table);
      
      this.logger.log(`Table ${id} status successfully updated to ${status}`);
      return updatedTable;
      
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating table ${id} status: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update table status');
    }
  }

  async generateQrCode(id: string): Promise<QrCodeResponseDto> {
    try {
      this.logger.log(`Generating QR code for table ${id}`);
      
      // First, verify the table exists
      const table = await this.findOne(id);
      
      // Get the frontend URL from environment variables
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      
      // Create the customer menu URL with table ID
      const menuUrl = `${frontendUrl}/customer/menu?tableId=${id}`;
      
      this.logger.log(`Generating QR code for URL: ${menuUrl}`);
      
      // Generate QR code as base64 data URL
      const qrCodeDataUrl: string = await QRCode.toDataURL(menuUrl, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256
      });
      
      // Validate the QR code data
      if (!qrCodeDataUrl || !qrCodeDataUrl.startsWith('data:image/png;base64,')) {
        this.logger.error(`Generated QR code has invalid format for table ${id}`);
      } else {
        this.logger.log(`QR code generated successfully for table ${id}, length: ${qrCodeDataUrl.length}`);
      }
      
      const responseData = {
        qrCode: qrCodeDataUrl,
        url: menuUrl,
        table: {
          id: table.id,
          name: table.name,
          capacity: table.capacity
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
          size: qrCodeDataUrl.length,
          format: 'PNG'
        }
      };
      
      this.logger.log(`Returning QR code response for table ${id}`);
      return responseData;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error generating QR code for table ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to generate QR code');
    }
  }

  private isValidStatusTransition(currentStatus: TableStatus, newStatus: TableStatus, userRole: UserRole): boolean {
    // Admin can make any status transition
    if (userRole === UserRole.ADMIN) {
      return true;
    }

    // Staff can only make certain transitions
    if (userRole === UserRole.STAFF) {
      const allowedTransitions = {
        [TableStatus.AVAILABLE]: [TableStatus.OCCUPIED],
        [TableStatus.OCCUPIED]: [TableStatus.AVAILABLE],
        [TableStatus.RESERVED]: [TableStatus.OCCUPIED, TableStatus.AVAILABLE],
      };

      return allowedTransitions[currentStatus]?.includes(newStatus) || false;
    }

    return false;
  }
}
