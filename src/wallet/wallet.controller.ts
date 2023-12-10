import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiExtraModels, ApiCreatedResponse } from '@nestjs/swagger';
import { ApiStandardResponse } from 'src/decorators/ApiStandardResponse';
import { WalletService } from './wallet.service';
import Wallet from './model/Wallet';
import { FundMyAccountDto, TransferAccountDto } from './dtos/wallet.dto';
import { generateHash, generateRef } from 'src/utils';
import { UsersService } from 'src/users/users.service';
import { TransactionType } from 'src/transactions/model/Transactions';
import { ResponseManager } from 'src/utils/responseManager';

@ApiTags('Wallet')
@Controller('wallet')
@ApiExtraModels()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @HttpCode(200)
  @ApiStandardResponse(ApiCreatedResponse, Wallet, 'View User Wallet Details')
  async getWallet(@Req() req: Request) {
    return await this.walletService.getWallet({
      user: { id: Number(req.user.id) },
    });
  }

  @Post('fund-me')
  @HttpCode(201)
  @ApiStandardResponse(ApiCreatedResponse, Wallet, 'Fund My Wallet')
  async fundMyAccount(
    @Req() req: Request,
    @Body(new ValidationPipe())
    fundMyAccountDto: FundMyAccountDto,
  ) {
    const reference = generateRef(10);
    const transactionHash = generateHash();

    fundMyAccountDto.reference = reference;
    fundMyAccountDto.transactionHash = transactionHash;

    const transaction = await this.walletService.fundMyAccount(
      fundMyAccountDto,
      req,
    );

    return ResponseManager.StandardResponse(
      true,
      HttpStatus.CREATED,
      'Wallet Funded Successfully',
      transaction,
    );
  }

  @Post('transfer-to-user')
  @HttpCode(201)
  @ApiStandardResponse(
    ApiCreatedResponse,
    Wallet,
    'Transfer To User Wallet By Account Number',
  )
  async transferToUserByEmail(
    @Req() req: Request,
    @Body(new ValidationPipe())
    transferAccountDto: TransferAccountDto,
  ) {
    const reference = generateRef(10);
    const transactionHash = generateHash();

    transferAccountDto.reference = reference;
    transferAccountDto.transactionHash = transactionHash;

    await this.walletService.processFundTransfer(transferAccountDto, req);

    return ResponseManager.StandardResponse(
      true,
      HttpStatus.CREATED,
      `Wallet Fund Transfer To ${transferAccountDto.receiverAccountNo} was successful`,
    );
  }

  @Get('get-details/:accountNumber')
  @HttpCode(200)
  @ApiStandardResponse(
    ApiCreatedResponse,
    Wallet,
    'Fetch Wallet Details By Account Number',
  )
  async getDetails(@Req() req: Request) {
    const accountNumber = req.params.accountNumber;
    if (!accountNumber) {
      throw new HttpException(
        'Account number is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (accountNumber.length !== 10) {
      throw new HttpException(
        'Account number must be 10 characters long',
        HttpStatus.BAD_REQUEST,
      );
    }

    const details = await this.walletService.getOne({
      walletAccountNo: String(accountNumber),
    });

    if (!details) {
      throw new HttpException(
        `It seems this account number ${accountNumber} does not exist in our records`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const data = {
      accountName: `${details.user.firstName} ${details.user.lastName}`,
      accountNumber: details.walletAccountNo,
    };

    return ResponseManager.StandardResponse(
      true,
      HttpStatus.OK,
      `Account wallet details fetched successfully`,
      data,
    );
  }
}
