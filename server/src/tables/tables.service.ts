import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableEntity } from '../entities/table.entity';
import { CreateTableDto, UpdateTableDto } from './dto';
import { TableStatus } from '../enums/table-status.enum';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(TableEntity)
    private tableRepository: Repository<TableEntity>,
  ) {}

  async findAll(status?: TableStatus): Promise<TableEntity[]> {
    if (status) {
      return this.tableRepository.find({ where: { status } });
    }
    return this.tableRepository.find();
  }

  async findOne(id: string): Promise<TableEntity | null> {
    return this.tableRepository.findOneBy({ id });
  }

  async create(createTableDto: CreateTableDto): Promise<TableEntity> {
    const table = this.tableRepository.create({
      ...createTableDto,
      status: TableStatus.AVAILABLE, // Default status for new tables
    });
    return this.tableRepository.save(table);
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<TableEntity | null> {
    const table = await this.tableRepository.findOneBy({ id });
    if (!table) {
      return null;
    }
    
    this.tableRepository.merge(table, updateTableDto);
    return this.tableRepository.save(table);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.tableRepository.delete(id);
    return result.affected !== null && result.affected !== undefined && result.affected > 0;
  }

  async updateStatus(id: string, status: TableStatus): Promise<TableEntity | null> {
    const table = await this.tableRepository.findOneBy({ id });
    if (!table) {
      return null;
    }
    
    table.status = status;
    return this.tableRepository.save(table);
  }
}
