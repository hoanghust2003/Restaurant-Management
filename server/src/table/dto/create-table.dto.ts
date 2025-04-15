import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { TableStatus } from '../entities/table.entity';

export class CreateTableDto {
  @IsNotEmpty()
  @IsString()
  tableNumber: string;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus = TableStatus.AVAILABLE;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(20)
  capacity?: number = 4;
  
  @IsOptional()
  @IsString()
  qrCode?: string;
}