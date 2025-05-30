import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards, ParseUUIDPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { CreateBatchDto, UpdateBatchDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('batches')
@Controller('batches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Get all batches' })
  @ApiResponse({ status: 200, description: 'Returns all batches' })
  async findAll(@Query('include_deleted') includeDeleted: boolean = false) {
    return await this.batchesService.findAll(includeDeleted);
  }

  @Get('expiring')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Get expiring batches' })
  @ApiResponse({ status: 200, description: 'Returns batches expiring soon' })
  async getExpiringBatches(@Query('days') days: number = 7) {
    return await this.batchesService.getExpiringBatches(days);
  }

  @Get('expired')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Get expired batches' })
  @ApiResponse({ status: 200, description: 'Returns expired batches' })
  async findExpiredBatches() {
    return await this.batchesService.getExpiringBatches();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Get batch by ID' })
  @ApiResponse({ status: 200, description: 'Returns the batch' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('include_deleted') includeDeleted: boolean = false
  ) {
    return await this.batchesService.findOne(id, includeDeleted);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Create a new batch' })
  @ApiResponse({ status: 201, description: 'Batch successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createBatchDto: CreateBatchDto, @Req() req) {
    return await this.batchesService.create(createBatchDto, req.user.role);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Update a batch' })
  @ApiResponse({ status: 200, description: 'Batch successfully updated' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBatchDto: UpdateBatchDto,
    @Req() req
  ) {
    return await this.batchesService.update(id, updateBatchDto, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a batch' })
  @ApiResponse({ status: 204, description: 'Batch successfully deleted' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return await this.batchesService.softDelete(id, req.user.role);
  }

  @Put(':id/restore')
  @Roles(UserRole.ADMIN, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Restore a deleted batch' })
  @ApiResponse({ status: 200, description: 'Batch successfully restored' })
  @ApiResponse({ status: 404, description: 'Batch not found' })
  async restore(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return await this.batchesService.restore(id, req.user.role);
  }
}
