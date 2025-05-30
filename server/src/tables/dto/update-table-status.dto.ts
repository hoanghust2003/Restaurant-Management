import { IsNotEmpty, IsEnum } from 'class-validator';
import { TableStatus } from '../../enums/table-status.enum';

export class UpdateTableStatusDto {
  @IsNotEmpty()
  @IsEnum(TableStatus)
  status: TableStatus;
}
