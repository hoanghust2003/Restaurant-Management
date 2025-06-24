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
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TablesService } from './tables.service';
import {
  CreateTableDto,
  UpdateTableDto,
  UpdateTableStatusDto,
  QrCodeResponseDto,
} from './dto';
import { TableEntity } from '../entities/table.entity';
import { TableStatus } from '../enums/table-status.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';

import { BadRequestException } from '@nestjs/common';

// Extend the Express Request interface
interface RequestWithUser extends Request {
  user: {
    role: UserRole;
    id: string;
    email?: string;
  };
}

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}
  @Get()
  async findAll(
    @Query('status') status?: TableStatus,
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<TableEntity[]> {
    const include = includeDeleted === 'true';
    return this.tablesService.findAll(status, include);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<TableEntity> {
    const include = includeDeleted === 'true';
    return this.tablesService.findOne(id, include);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createTableDto: CreateTableDto,
    @Req() req: RequestWithUser,
  ): Promise<TableEntity> {
    try {
      return await this.tablesService.create(createTableDto);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Không thể tạo bàn mới. Vui lòng thử lại.',
      );
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<TableEntity> {
    return this.tablesService.update(id, updateTableDto, UserRole.ADMIN);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.tablesService.remove(id, req.user.role);
    return { message: 'Đã xóa bàn thành công' };
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async restore(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    await this.tablesService.restore(id, req.user.role);
    return { message: 'Đã khôi phục bàn thành công' };
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
    @Req() req: RequestWithUser,
  ): Promise<TableEntity> {
    try {
      return await this.tablesService.updateStatus(
        id,
        updateTableStatusDto.status,
        req.user.role,
      );
    } catch (error) {
      // Use logger or handle specific error types as needed
      throw error;
    }
  }

  @Get(':id/qr-code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  async generateQrCode(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QrCodeResponseDto> {
    return this.tablesService.generateQrCode(id);
  }
}
