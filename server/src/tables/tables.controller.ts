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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
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

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}
  
  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  @ApiQuery({ name: 'status', enum: TableStatus, required: false, description: 'Filter by table status' })
  @ApiQuery({ name: 'includeDeleted', type: 'string', required: false, description: 'Include deleted tables (true/false)' })
  @ApiResponse({ status: 200, description: 'Returns list of tables' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiParam({ name: 'id', description: 'Table ID', type: 'string' })
  @ApiQuery({ name: 'includeDeleted', type: 'string', required: false, description: 'Include deleted tables (true/false)' })
  @ApiResponse({ status: 200, description: 'Returns table details' })
  @ApiResponse({ status: 404, description: 'Table not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create new table' })
  @ApiResponse({ status: 201, description: 'Table created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiBody({ type: CreateTableDto })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update table' })
  @ApiParam({ name: 'id', description: 'Table ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Table updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiBody({ type: UpdateTableDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
  ): Promise<TableEntity> {
    return this.tablesService.update(id, updateTableDto, UserRole.ADMIN);
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete table (soft delete)' })
  @ApiParam({ name: 'id', description: 'Table ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Table not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Restore deleted table' })
  @ApiParam({ name: 'id', description: 'Table ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Table restored successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Table not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update table status' })
  @ApiParam({ name: 'id', description: 'Table ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Table status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  @ApiBody({ type: UpdateTableStatusDto })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate QR code for table' })
  @ApiParam({ name: 'id', description: 'Table ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Returns QR code data', type: QrCodeResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Table not found' })
  async generateQrCode(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<QrCodeResponseDto> {
    return this.tablesService.generateQrCode(id);
  }
}
