import { IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({
    description: 'Table name',
    example: 'Bàn 1',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Table capacity (number of seats)',
    example: 4,
    minimum: 1,
    maximum: 50,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity: number;
}
