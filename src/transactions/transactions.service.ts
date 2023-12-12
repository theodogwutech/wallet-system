import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType, Transactions } from './model/Transactions';
import { Between, Like, QueryRunner, Repository } from 'typeorm';

import {
  CreateTransactionDto,
  TransactionQueryDto,
} from './dtos/transaction.dto';
import { sanitizeDateString } from 'src/utils';
import { Pagination } from 'src/utils/pagination';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private readonly transactionsRepository: Repository<Transactions>,
  ) {}

  async saveTransaction(
    createTransactionDto: CreateTransactionDto,
    queryRunner: QueryRunner,
  ): Promise<Transactions> {
    const transactions =
      this.transactionsRepository.create(createTransactionDto);

    if (!transactions) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException(
        'Transaction cannot be created',
        HttpStatus.BAD_REQUEST,
      );
    }

    await queryRunner.manager.save(transactions);

    return transactions;
  }

  async GetAllUserTransactions(req: Request, queryDto: TransactionQueryDto) {
    const fromDate = queryDto.fromDate
      ? sanitizeDateString(queryDto.fromDate)
      : null;
    const toDate = queryDto.toDate ? sanitizeDateString(queryDto.toDate) : null;

    const pagination = new Pagination({ fromDate, toDate, ...queryDto });

    const page = Math.floor(queryDto.page) || 1;
    const take = Math.floor(queryDto.take) || 10;
    const skip = take * (page - 1);

    const userId = req.user.id;

    const { search, sortDirection, transactionType } = queryDto;

    let sort;

    if (sortDirection === 'ASC') {
      sort = 'ASC';
    } else {
      sort = 'DESC';
    }

    let transType;
    if (Object.keys(transactionType).length > 0) {
      if (transactionType === TransactionType.CREDIT) {
        transType = TransactionType.CREDIT;
      } else {
        transType = TransactionType.DEBIT;
      }
    }

    let result;
    let total = 0;

    if (search) {
      const query = await this.transactionsRepository.find({
        where: {
          user: { id: userId },
          transactionHash: Like(`%${search}%`),
          transactionType: transType,
          ...(fromDate &&
            toDate && {
              transactionDate: Between(new Date(fromDate), new Date(toDate)),
            }),
        },
        order: { createdAt: sort },
        take,
        skip,
      });

      result = query.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        walletBalanceBefore: transaction.walletBalanceBefore,
        walletBalanceAfter: transaction.walletBalanceAfter,
        sender: transaction.sender,
        receiver: transaction.receiver,
        reference: transaction.reference,
        description: transaction.description,
        transactionHash: transaction.transactionHash,
        transactionType: transaction.transactionType,
        transactionDate: transaction.transactionDate,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        user: {
          id: transaction.user.id,
          email: transaction.user.email,
          firstName: transaction.user.firstName,
        },
      }));

      total = await this.transactionsRepository.count({
        where: {
          user: { id: userId },
          transactionHash: Like(`%${search}%`),
          transactionType: transType,
          ...(fromDate &&
            toDate && {
              transactionDate: Between(new Date(fromDate), new Date(toDate)),
            }),
        },
      });
    } else {
      const query = await this.transactionsRepository.find({
        where: {
          user: { id: userId },
          transactionType: transType,
          ...(fromDate &&
            toDate && {
              transactionDate: Between(new Date(fromDate), new Date(toDate)),
            }),
        },
        order: { createdAt: sort },
        take,
        skip,
      });

      result = query.map((transaction) => ({
        id: transaction.id,
        amount: transaction.amount,
        walletBalanceBefore: transaction.walletBalanceBefore,
        walletBalanceAfter: transaction.walletBalanceAfter,
        sender: transaction.sender,
        receiver: transaction.receiver,
        reference: transaction.reference,
        description: transaction.description,
        transactionHash: transaction.transactionHash,
        transactionType: transaction.transactionType,
        transactionDate: transaction.transactionDate,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        user: {
          id: transaction.user.id,
          email: transaction.user.email,
          firstName: transaction.user.firstName,
        },
      }));

      total = await this.transactionsRepository.count({
        where: { user: { id: userId }, transactionType: transType },
      });
    }

    return pagination.PaginateResponse(result, total, page, take);
  }
}

export default TransactionsService;
