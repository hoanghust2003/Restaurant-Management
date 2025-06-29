import { IsOptional, IsNotEmpty, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '../../enums/table-status.enum';

export class UpdateTableDto {
  @ApiProperty({
    description: 'Table name',
    example: 'Bàn 1',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'Table capacity (number of seats)',
    example: 4,
    minimum: 1,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity?: number;

  @ApiProperty({
    description: 'Table status',
    enum: TableStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;
}
