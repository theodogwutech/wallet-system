import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import Users from '../../users/model/Users';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @IsNotEmpty()
  user: Users;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  transactionType: string;

  @IsString()
  @IsNotEmpty()
  transactionHash: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsNumber()
  @IsNotEmpty()
  walletBalanceBefore: number;

  @IsNumber()
  @IsNotEmpty()
  walletBalanceAfter: number;

  sender: number;

  receiver: number;

  @IsNotEmpty()
  transactionDate: Date;
}

export class TransactionQueryDto {
  @IsNumber()
  @ApiPropertyOptional()
  @IsOptional()
  page: number;

  @IsNumber()
  @ApiPropertyOptional()
  @IsOptional()
  take: number;

  @IsDate()
  @ApiPropertyOptional()
  @IsOptional()
  fromDate: string;

  @IsDate()
  @ApiPropertyOptional()
  @IsOptional()
  toDate: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  search: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  sortDirection: string;

  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  transactionType: string;
}
