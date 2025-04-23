import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table, TableStatus } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import * as qrcode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const table = this.tableRepository.create(createTableDto);
    const savedTable = await this.tableRepository.save(table);
    
    // Generate QR code for the table
    await this.generateQRCode(savedTable.id);
    
    return savedTable;
  }

  async findAll(): Promise<Table[]> {
    return this.tableRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Table> {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  async findByStatus(status: TableStatus): Promise<Table[]> {
    return this.tableRepository.find({
      where: { status },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    // First check if table exists
    await this.findOne(id);
    
    // Update table
    await this.tableRepository.update(id, updateTableDto);
    
    // Return updated table
    return this.findOne(id);
  }

  async updateStatus(id: string, status: TableStatus): Promise<Table> {
    const table = await this.findOne(id);
    table.status = status;
    return this.tableRepository.save(table);
  }

  async remove(id: string): Promise<void> {
    const table = await this.findOne(id);
    await this.tableRepository.remove(table);
  }

  async generateQRCode(tableId: string): Promise<Table> {
    const table = await this.findOne(tableId);
    
    // QR Code data - URL to access the table in the frontend
    const qrData = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/menu?tableId=${tableId}`;
    
    try {
      // Create directory for QR codes if it doesn't exist
      const qrDir = path.join(process.cwd(), 'public', 'qr-codes');
      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
      }
      
      // Generate QR code
      const qrFilename = `table-${tableId}.png`;
      const qrPath = path.join(qrDir, qrFilename);
      
      await qrcode.toFile(qrPath, qrData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        scale: 8,
      });
      
      // Save QR code path to table
      table.qrCodeUrl = `/qr-codes/${qrFilename}`;
      return this.tableRepository.save(table);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return table;
    }
  }

  async getQRCode(tableId: string): Promise<{ qrCodeUrl: string }> {
    const table = await this.findOne(tableId);
    
    // If QR code doesn't exist, generate it
    if (!table.qrCodeUrl) {
      const updatedTable = await this.generateQRCode(tableId);
      return { qrCodeUrl: updatedTable.qrCodeUrl };
    }
    
    return { qrCodeUrl: table.qrCodeUrl };
  }
}