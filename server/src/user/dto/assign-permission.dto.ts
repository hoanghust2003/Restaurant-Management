import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPermissionDto {
  @IsNotEmpty()
  @IsUUID()
  permissionId: string;
}