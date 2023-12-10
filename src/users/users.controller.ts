import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiExtraModels, ApiCreatedResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, LoginUserDto } from './dtos/user.dto';
import { ApiStandardResponse } from 'src/decorators/ApiStandardResponse';
import { ResponseManager, StandardResponse } from 'src/utils/responseManager';
import Users from './model/Users';
import { AuthenticationProvider } from 'src/providers/AuthenticationProvider';

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
    const user = await this.usersService.Registration(createUserDto);

    return ResponseManager.StandardResponse(
      true,
      HttpStatus.CREATED,
      'Registration Successful. Please check your email for verification.',
      user,
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
      { user, accessToken },
    );
  }
}
