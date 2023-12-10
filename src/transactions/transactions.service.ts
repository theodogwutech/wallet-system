import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactions } from './model/Transactions';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { Query } from 'typeorm/driver/Query';
import { CreateTransactionDto } from './dtos/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private readonly transactionsRepository: Repository<Transactions>,
    private readonly _connection: Connection,
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
}
