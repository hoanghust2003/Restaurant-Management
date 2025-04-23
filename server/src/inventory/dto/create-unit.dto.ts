import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  abbreviation: string;
}