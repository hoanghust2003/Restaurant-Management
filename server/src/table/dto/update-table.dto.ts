import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Max } from 'class-validator';
import { TableStatus } from '../entities/table.entity';

export class UpdateTableDto {
  @IsOptional()
  @IsString()
  tableNumber?: string;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(20)
  capacity?: number;
  
  @IsOptional()
  @IsString()
  qrCode?: string;
}