import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TableStatus } from '../../enums/table-status.enum';

export class UpdateTableStatusDto {
  @ApiProperty({
    description: 'Table status',
    enum: TableStatus,
    example: TableStatus.AVAILABLE,
  })
  @IsNotEmpty()
  @IsEnum(TableStatus)
  status: TableStatus;
}
