import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table, TableStatus } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const table = this.tableRepository.create(createTableDto);
    return this.tableRepository.save(table);
  }

  async findAll(): Promise<Table[]> {
    return this.tableRepository.find({ order: { tableNumber: 'ASC' } });
  }

  async findOne(id: number): Promise<Table> {
    const table = await this.tableRepository.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return table;
  }

  async findByStatus(status: TableStatus): Promise<Table[]> {
    return this.tableRepository.find({ 
      where: { status },
      order: { tableNumber: 'ASC' },
    });
  }

  async update(id: number, updateTableDto: UpdateTableDto): Promise<Table> {
    const table = await this.findOne(id);
    
    // Cập nhật các trường của bàn
    Object.assign(table, updateTableDto);
    
    return this.tableRepository.save(table);
  }

  async updateStatus(id: number, status: TableStatus): Promise<Table> {
    const table = await this.findOne(id);
    table.status = status;
    return this.tableRepository.save(table);
  }

  async remove(id: number): Promise<void> {
    const table = await this.findOne(id);
    await this.tableRepository.remove(table);
  }
  
  async generateQRCode(id: number): Promise<Table> {
    const table = await this.findOne(id);
    // Tạo mã QR code cho bàn (đơn giản là URL của ứng dụng + id bàn)
    const baseUrl = process.env.FRONTEND_URL || 'https://restaurant-app.com';
    table.qrCode = `${baseUrl}/table/${id}`;
    return this.tableRepository.save(table);
  }
}