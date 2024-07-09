import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('api/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(201)
  @Post('/')
  async createUser(@Body() createUserDTO: CreateUserDTO) {
    try {
      const response = await this.usersService.createUser({
        ...createUserDTO,
      });

      return { message: 'User created', response };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Operation failed',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:userId')
  async getUserById(@Param('userId') userId: string) {
    try {
      const response = await this.usersService.getUserById(userId);
      return { message: 'User fetched successfully', response };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Operation failed',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:userId/avatar')
  async getUserAvatar(@Param('userId') userId: string) {
    try {
      const response = await this.usersService.getUserAvatar(userId);
      return { message: 'User avatar fetched', response };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Operation failed',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('/:userId/avatar')
  async deleteUserAvatar(@Param('userId') userId: string) {
    try {
      const response = await this.usersService.deleteUserAvatar(userId);
      return { message: 'User avatar deleted', response };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Operation failed',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
