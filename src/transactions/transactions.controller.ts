import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationMeta } from 'src/shared/paginationMeta';
import { ResponseManager, StandardResponse } from 'src/utils/responseManager';
import { TransactionQueryDto } from './dtos/transaction.dto';
import { PaginationQueryDto } from 'src/shared/global.dto';
import TransactionService from './transactions.service';
import Transactions from './model/Transactions';
import { ApiStandardResponse } from 'src/decorators/ApiStandardResponse';
@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
@ApiExtraModels(
  PaginationMeta,
  StandardResponse,
  TransactionQueryDto,
  PaginationQueryDto,
)
export class TransactionsController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('me')
  @HttpCode(200)
  @ApiStandardResponse(
    ApiCreatedResponse,
    Transactions,
    'Get a Users Transactions',
  )
  async GetAllUserTransactions(
    @Req() req: Request,
    @Query() QueryDto: TransactionQueryDto,
  ): Promise<StandardResponse<Transactions[] | any>> {
    const result = await this.transactionService.GetAllUserTransactions(
      req,
      QueryDto,
    );
    return ResponseManager.StandardResponse(
      true,
      HttpStatus.OK,
      'Transactions fetched successfully',
      result,
    );
  }
}
