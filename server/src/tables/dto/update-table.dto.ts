import { IsOptional, IsNotEmpty, IsInt, Min, Max, IsEnum } from 'class-validator';
import { TableStatus } from '../../enums/table-status.enum';

export class UpdateTableDto {
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity?: number;

  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}
