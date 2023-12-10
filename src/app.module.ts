import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouteLogger } from './middlewares/routelogger.middleware';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import * as dotenv from 'dotenv';
import Users from './users/model/Users';
import Wallet from './wallet/model/Wallet';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { TransactionsModule } from './transactions/transactions.module';
import Transactions from './transactions/model/Transactions';
dotenv.config();

const routes = [
  {
    path: '/wallet',
    method: RequestMethod.ALL,
  },
  {
    path: '/wallet/fund-me',
    method: RequestMethod.ALL,
  },
  {
    path: '/wallet/:id',
    method: RequestMethod.ALL,
  },
  {
    path: '/wallet/:id/transactions',
    method: RequestMethod.ALL,
  },
  {
    path: '/wallet/:id/transactions/:transactionId',
    method: RequestMethod.ALL,
  },
];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: String(process.env.POSTGRES_PASSWORD),
      database: process.env.POSTGRES_DB,
      synchronize: true, // Set false in production
      logging: false,
      entities: [Users, Wallet, Transactions],
    }),
    UsersModule,
    WalletModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RouteLogger)
      .forRoutes('*')
      .apply(AuthMiddleware)
      .forRoutes(...routes);
  }
}
