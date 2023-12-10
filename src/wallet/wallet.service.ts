import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import Wallet from './model/Wallet';
import { Connection, FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateWalletDto, FundMyAccountDto } from './dtos/wallet.dto';
import { TransactionsService } from 'src/transactions/transactions.service';
import e, { Request } from 'express';
import { generateHash, generateRef } from 'src/utils';
import { TransactionType } from 'src/transactions/model/Transactions';
import { UsersService } from 'src/users/users.service';
import Users from 'src/users/model/Users';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly _connection: Connection,
    private readonly transactionsService: TransactionsService,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async createWallet(
    createWalletDto: CreateWalletDto,
    queryRunner: QueryRunner,
  ) {
    const wallet = new Wallet();
    wallet.user = createWalletDto.user;
    wallet.walletAccountNo = createWalletDto.walletAccountNo;

    return queryRunner.manager.save(wallet);
  }

  async getOne(query: FindOptionsWhere<Wallet>): Promise<Wallet> {
    const result = await this.walletRepository.findOneBy(query);

    return result;
  }

  async getWallet(query) {
    const result = await this.walletRepository.findOneBy(query);

    const { user, createdAt, updatedAt, ...wallet } = result;

    let userDetails = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return { ...wallet, ...userDetails };
  }

  async generateWalletAccountNo(): Promise<string> {
    const walletAccountNo = Math.floor(1000000000 + Math.random() * 9000000000);

    const checkIfExist = await this.getOne({
      walletAccountNo: String(walletAccountNo),
    });

    return checkIfExist
      ? await this.generateWalletAccountNo()
      : String(walletAccountNo);
  }

  async creditWallet(
    wallet: Wallet,
    amount: number,
    queryRunner: QueryRunner,
  ): Promise<Wallet> {
    const { balance } = wallet;

    wallet.balanceBefore = balance;
    wallet.balanceAfter = balance + amount;
    wallet.balance += amount;
    wallet.updatedAt = new Date();
    wallet.lastCreditAmount = amount;
    wallet.lastDepositDate = new Date();

    return queryRunner.manager.save(wallet);
  }

  async debitWallet(
    wallet: Wallet,
    amount: number,
    queryRunner: QueryRunner,
  ): Promise<Wallet> {
    const { balance } = wallet;

    wallet.updatedAt = new Date();
    wallet.balanceAfter = balance - amount;
    wallet.balanceBefore = balance;
    wallet.balance -= amount;
    wallet.lastDebitAmount = amount;
    wallet.lastDebitDate = new Date();

    return queryRunner.manager.save(wallet);
  }

  async fundMyAccount(
    fundMyAccountDto: FundMyAccountDto,
    req: Request,
  ): Promise<Wallet> {
    let wallet: Wallet;

    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await this.usersRepository.findOneBy({
      id: req.user.id,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const getWallet = await this.getOne({
      user: { id: Number(req.user.id) },
    });

    if (!getWallet) {
      throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }

    fundMyAccountDto.user = user;
    fundMyAccountDto.transactionType = TransactionType.CREDIT;
    fundMyAccountDto.amount = Number(fundMyAccountDto.amount);
    fundMyAccountDto.description = `₦${fundMyAccountDto.amount} was credited to your wallet`;
    fundMyAccountDto.transactionDate = new Date();
    fundMyAccountDto.walletBalanceBefore = Number(getWallet.balance);
    fundMyAccountDto.walletBalanceAfter =
      getWallet.balance + fundMyAccountDto.amount;
    fundMyAccountDto.wallet = getWallet;
    fundMyAccountDto.sender = user.id;
    fundMyAccountDto.receiver =
      fundMyAccountDto.receiver !== null ? fundMyAccountDto.receiver : null;
    const creditWallet = await this.creditWallet(
      fundMyAccountDto.wallet,
      fundMyAccountDto.amount,
      queryRunner,
    );

    if (!creditWallet) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException(
        'Wallet cannot be credited',
        HttpStatus.BAD_REQUEST,
        { cause: new Error() },
      );
    }

    const transaction = await this.transactionsService.saveTransaction(
      fundMyAccountDto,
      queryRunner,
    );

    if (!transaction) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException(
        'Transaction cannot be saved',
        HttpStatus.BAD_REQUEST,
        { cause: new Error() },
      );
    }

    await queryRunner.commitTransaction();

    return wallet;
  }

  async debitMyAccount(
    fundMyAccountDto: FundMyAccountDto,
    req: Request,
  ): Promise<Wallet> {
    let wallet: Wallet;

    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await this.usersRepository.findOneBy({
      id: req.user.id,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const getWallet = await this.getOne({
      user: { id: Number(req.user.id) },
    });

    if (!getWallet) {
      throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
    }

    if (Math.sign(fundMyAccountDto.amount) === -1) {
      throw new HttpException(
        'Amount cannot be negative',
        HttpStatus.BAD_REQUEST,
      );
    }

    fundMyAccountDto.user = user;
    fundMyAccountDto.transactionType = TransactionType.CREDIT;
    fundMyAccountDto.amount = Number(fundMyAccountDto.amount);
    fundMyAccountDto.description = `₦${fundMyAccountDto.amount} was debited from your wallet`;
    fundMyAccountDto.transactionDate = new Date();
    fundMyAccountDto.walletBalanceBefore = Number(getWallet.balance);
    fundMyAccountDto.walletBalanceAfter =
      getWallet.balance + fundMyAccountDto.amount;
    fundMyAccountDto.wallet = getWallet;

    const creditWallet = await this.creditWallet(
      fundMyAccountDto.wallet,
      fundMyAccountDto.amount,
      queryRunner,
    );

    if (!creditWallet) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException(
        'Wallet cannot be credited',
        HttpStatus.BAD_REQUEST,
        { cause: new Error() },
      );
    }

    const transaction = await this.transactionsService.saveTransaction(
      fundMyAccountDto,
      queryRunner,
    );

    if (!transaction) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException(
        'Transaction cannot be saved',
        HttpStatus.BAD_REQUEST,
        { cause: new Error() },
      );
    }

    await queryRunner.commitTransaction();

    return wallet;
  }

  async processFundTransfer(
    fundMyAccountDto: FundMyAccountDto,
    req: Request,
  ): Promise<Wallet> {
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const user = await this.usersRepository.findOneBy({
      id: req.user.id,
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const getReceiver = await this.usersRepository.findOneBy({
      email: fundMyAccountDto.receiverAccountNo,
    });

    if (!getReceiver) {
      throw new HttpException('Receiver not found', HttpStatus.NOT_FOUND);
    }

    const senderWallet = await this.getOne({
      user: { id: Number(req.user.id) },
    });

    if (!senderWallet) {
      throw new HttpException('Sender Wallet not found', HttpStatus.NOT_FOUND);
    }

    const receiverWallet = await this.getOne({
      user: { id: Number(getReceiver.id) },
    });

    if (!receiverWallet) {
      throw new HttpException(
        'Receiver Wallet not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (Math.sign(fundMyAccountDto.amount) === -1) {
      throw new HttpException(
        'Amount cannot be negative',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (fundMyAccountDto.amount > senderWallet.balance) {
      throw new HttpException('Insufficient funds', HttpStatus.BAD_REQUEST);
    }

    const result = await Promise.all([
      // Perform debit operation
      await this.debitWallet(
        senderWallet,
        fundMyAccountDto.amount,
        queryRunner,
      ),

      // Save debit transaction
      await this.transactionsService.saveTransaction(
        // Update fundMyAccountDto for debit
        Object.assign(fundMyAccountDto, {
          user,
          transactionType: TransactionType.DEBIT,
          amount: Number(fundMyAccountDto.amount),
          description: `₦${fundMyAccountDto.amount} was debited from your wallet`,
          transactionDate: new Date(),
          walletBalanceBefore: Number(senderWallet.balance),
          walletBalanceAfter: senderWallet.balance + fundMyAccountDto.amount,
          wallet: senderWallet,
          sender: user.id,
          receiver: getReceiver.id,
        }),
        queryRunner,
      ),

      // Perform credit operation
      await this.creditWallet(
        receiverWallet,
        fundMyAccountDto.amount,
        queryRunner,
      ),

      // Save credit transaction
      await this.transactionsService.saveTransaction(
        // Update fundMyAccountDto for credit
        Object.assign(fundMyAccountDto, {
          user,
          transactionType: TransactionType.CREDIT,
          amount: Number(fundMyAccountDto.amount),
          description: `₦${fundMyAccountDto.amount} was credited to your wallet.`,
          transactionDate: new Date(),
          walletBalanceBefore: Number(receiverWallet.balance),
          walletBalanceAfter: receiverWallet.balance + fundMyAccountDto.amount,
          wallet: receiverWallet,
          sender: user.id,
          receiver: getReceiver.id,
        }),
        queryRunner,
      ),
    ]);

    const filterResult = result.filter((item) => item === undefined);

    if (filterResult.length > 0) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException(
        'Something happened while processing your transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: new Error() },
      );
    }

    await queryRunner.commitTransaction();

    return senderWallet;
  }
}
