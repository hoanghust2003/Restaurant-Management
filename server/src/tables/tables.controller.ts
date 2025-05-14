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
  ParseUUIDPipe,
  UseGuards,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { TablesService } from './tables.service';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto } from './dto';
import { TableEntity } from '../entities/table.entity';
import { TableStatus } from '../enums/table-status.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

// Extend the Express Request interface
interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

@Controller('tables')
@UseGuards(RolesGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.WAITER, UserRole.CASHIER)
  async findAll(@Query('status') status?: TableStatus): Promise<TableEntity[]> {
    return this.tablesService.findAll(status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.WAITER, UserRole.CASHIER)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TableEntity> {
    return this.tablesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createTableDto: CreateTableDto,
    @Req() req: RequestWithUser,
  ): Promise<TableEntity> {
    return this.tablesService.create(createTableDto, req.user.role);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
    @Req() req: RequestWithUser,
  ): Promise<TableEntity> {
    return this.tablesService.update(id, updateTableDto, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    await this.tablesService.remove(id, req.user.role);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.WAITER, UserRole.CASHIER)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<TableEntity> {
    return this.tablesService.updateStatus(
      id, 
      updateTableStatusDto.status, 
      req.user.role
    );
  }
}
