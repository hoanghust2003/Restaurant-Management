import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Table, TableStatus } from './entities/table.entity';

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  create(@Body() createTableDto: CreateTableDto): Promise<Table> {
    return this.tableService.create(createTableDto);
  }

  @Get()
  findAll(): Promise<Table[]> {
    return this.tableService.findAll();
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: TableStatus): Promise<Table[]> {
    return this.tableService.findByStatus(status);
  }

  @Get('available')
  findAvailable(): Promise<Table[]> {
    return this.tableService.findByStatus(TableStatus.AVAILABLE);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Table> {
    return this.tableService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<Table> {
    return this.tableService.update(id, updateTableDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: TableStatus,
  ): Promise<Table> {
    return this.tableService.updateStatus(id, status);
  }

  @Post(':id/qrcode')
  generateQRCode(@Param('id', ParseIntPipe) id: number): Promise<Table> {
    return this.tableService.generateQRCode(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tableService.remove(id);
  }
}