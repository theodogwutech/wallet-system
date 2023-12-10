import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import Users from './model/Users';
import { Connection, FindOptionsWhere, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto, LoginUserDto } from './dtos/user.dto';
import { AuthenticationProvider } from 'src/providers/AuthenticationProvider';
import Wallet from 'src/wallet/model/Wallet';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly walletService: WalletService,
    private readonly _connection: Connection,
  ) {}

  async Registration(createUserDto: CreateUserDto): Promise<Users> {
    let user: Users;
    const queryRunner = this._connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    user = await this.CreateUser(createUserDto, queryRunner);

    await queryRunner.commitTransaction();

    return user;
  }

  async CreateUser(
    createUserDto: CreateUserDto,
    queryRunner: QueryRunner,
  ): Promise<Users> {
    const userExists = await this.getOne({
      email: createUserDto.email,
    });

    if (userExists) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    createUserDto.email = createUserDto.email.toLowerCase();
    createUserDto.password = await AuthenticationProvider.hashPassword(
      createUserDto.password,
    );
    const user = this.usersRepository.create(createUserDto);

    if (!user) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException('User cannot be created', HttpStatus.BAD_REQUEST);
    }

    await queryRunner.manager.save(user);

    const wallet: Wallet = await this.walletService.createWallet(
      {
        user: user,
        walletAccountNo: await this.walletService.generateWalletAccountNo(),
      },
      queryRunner,
    );

    if (!wallet) {
      await queryRunner.rollbackTransaction();

      await queryRunner.release();

      throw new HttpException('Wallet creation failed', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  async getOne(query: FindOptionsWhere<Users>): Promise<Users> {
    const result = await this.usersRepository.findOneBy(query);

    return result;
  }

  async Login(loginUserDto: LoginUserDto): Promise<Users> {
    const user = await this.getOne({
      email: loginUserDto.email,
    });

    if (!user) {
      throw new HttpException(
        "It looks like we don't have an account with that email address. Double-check your email or consider signing up if you're new here",
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordMatch = await AuthenticationProvider.comparePassword(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new HttpException(
        'It seems like the password you entered is incorrect. Please check and try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = undefined;
    user.createdAt = undefined;
    user.updatedAt = undefined;
    user.isDeleted = undefined;
    user.isDisabled = undefined;
    user.deletedAt = undefined;

    return user;
  }
}
