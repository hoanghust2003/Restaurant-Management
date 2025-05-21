import { TableStatus } from '@/app/utils/enums';

export interface TableModel {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  deleted_at?: Date | null;
}

export interface CreateTableDto {
  name: string;
  capacity: number;
}

export interface UpdateTableDto {
  name?: string;
  capacity?: number;
  status?: TableStatus;
}
