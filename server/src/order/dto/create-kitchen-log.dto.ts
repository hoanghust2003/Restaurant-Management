import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum KitchenAction {
  STARTED = 'started',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

export class CreateKitchenLogDto {
  @IsNotEmpty()
  @IsUUID()
  orderItemId: string;

  @IsNotEmpty()
  @IsEnum(KitchenAction)
  action: KitchenAction;
}