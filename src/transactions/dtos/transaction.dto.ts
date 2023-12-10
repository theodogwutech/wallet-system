import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import Users from 'src/users/model/Users';

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
