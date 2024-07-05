import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('api/user')
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiConsumes('multipart/form-data')
  @Post('/')
  @UseInterceptors(FileInterceptor('avatar'))
  async createUser(
    @Body() createUserDTO: CreateUserDTO,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    try {
      createUserDTO.avatar = avatar;
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
      return { message: 'User created', response };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Operation failed',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
