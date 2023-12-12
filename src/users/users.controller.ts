import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiExtraModels,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto } from './dtos/user.dto';
import { ApiStandardResponse } from '../decorators/ApiStandardResponse';
import { ResponseManager, StandardResponse } from '../utils/responseManager';
import Users from './model/Users';
import { AuthenticationProvider } from '../providers/AuthenticationProvider';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
@ApiExtraModels()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(201)
  @ApiStandardResponse(ApiCreatedResponse, CreateUserDto, 'Registers a User')
  async CreateUser(
    @Body(
      new ValidationPipe({
        forbidUnknownValues: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    createUserDto: CreateUserDto,
  ): Promise<StandardResponse<Users>> {
    await this.usersService.Registration(createUserDto);

    return ResponseManager.StandardResponse(
      true,
      HttpStatus.CREATED,
      'Registration Successful. Please check your email for verification.',
    );
  }

  @Post('login')
  @HttpCode(200)
  @ApiStandardResponse(ApiCreatedResponse, LoginUserDto, 'Login a User')
  async LoginUser(
    @Body(
      new ValidationPipe({
        forbidUnknownValues: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    loginUserDto: LoginUserDto,
  ): Promise<StandardResponse<Users | any>> {
    const user = await this.usersService.Login(loginUserDto);

    const accessToken = await AuthenticationProvider.generateJWT(user);

    return ResponseManager.StandardResponse(
      true,
      HttpStatus.OK,
      `Welcome back ${user.firstName}`,
      { ...user, accessToken },
    );
  }
}
