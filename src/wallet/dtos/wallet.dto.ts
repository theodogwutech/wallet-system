import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import Users from '../../users/model/Users';
import Wallet from '../model/Wallet';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  walletAccountNo: string;

  @IsNotEmpty()
  user: Users;
}

export class FundMyAccountDto {
  user: Users;

  wallet: Wallet;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  transactionType: string;

  transactionHash: string;

  description: string;

  reference: string;

  walletBalanceBefore: number;

  walletBalanceAfter: number;

  transactionDate: Date;

  sender: number;

  receiver: number;

  receiverAccountNo: string;
}

export class TransferAccountDto {
  user: Users;

  wallet: Wallet;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  transactionType: string;

  transactionHash: string;

  description: string;

  reference: string;

  walletBalanceBefore: number;

  walletBalanceAfter: number;

  transactionDate: Date;

  sender: number;

  receiver: number;

  @IsString()
  @IsNotEmpty()
  receiverAccountNo: string;
}
