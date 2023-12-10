import { Module, forwardRef } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Wallet from './model/Wallet';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { UsersModule } from 'src/users/users.module';
import Users from 'src/users/model/Users';
import Transactions from 'src/transactions/model/Transactions';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, Users, Transactions]),
    forwardRef(() => UsersModule),
    TransactionsModule,
  ],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
