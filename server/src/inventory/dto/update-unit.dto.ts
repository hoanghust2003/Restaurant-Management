import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateUnitDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  abbreviation?: string;
}