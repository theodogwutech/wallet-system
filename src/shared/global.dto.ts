import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class PaginationQueryDto {
  @IsNumber()
  @ApiPropertyOptional()
  page: number;

  @IsNumber()
  @ApiPropertyOptional()
  take: number;

  @IsDate()
  @ApiPropertyOptional()
  fromDate: string;

  @IsDate()
  @ApiPropertyOptional()
  toDate: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  search: string;
}
