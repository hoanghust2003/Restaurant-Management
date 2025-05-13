import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Patch, 
  Body, 
  Param, 
  Query, 
  NotFoundException,
  ParseUUIDPipe
} from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto } from './dto';
import { TableEntity } from '../entities/table.entity';
import { TableStatus } from '../enums/table-status.enum';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  async findAll(@Query('status') status?: TableStatus): Promise<TableEntity[]> {
    return this.tablesService.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TableEntity> {
    const table = await this.tablesService.findOne(id);
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  @Post()
  async create(@Body() createTableDto: CreateTableDto): Promise<TableEntity> {
    return this.tablesService.create(createTableDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<TableEntity> {
    const table = await this.tablesService.update(id, updateTableDto);
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const result = await this.tablesService.remove(id);
    if (!result) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
  ): Promise<TableEntity> {
    const table = await this.tablesService.updateStatus(id, updateTableStatusDto.status);
    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }
    return table;
  }
}
