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
  Res,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { Subject } from 'rxjs';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('/user')
export class UsersController {
  private postCreatedSubject = new Subject<any>();

  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

  @Get('/:id/blogs')
  createPost(@Param('id') id: number) {
    try {
      const response = this.usersService.createPost(id);

      return { message: 'User avatar deleted', response };
    } catch (error) {
      throw new HttpException(
        error?.message || 'Operation failed',
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Sse('/:id/events')
  // sse(): Observable<any> {
  //   return fromEvent(this.eventEmitter, 'postCreated').pipe(
  //     map((payload) => ({
  //       data: JSON.stringify(payload),
  //     })),
  //   );
  // }
  // streamMessages(
  //   @Param('chatId') chatId: string,
  // ): Observable<{ id: number; title: string; excerpt: string }> {
  //   return this.usersService.getMessageStream().pipe(
  //     map((message) => ({
  //       id: message.id,
  //       title: message.title,
  //       excerpt: message.excerpt,
  //     })),
  //   );
  // }

  // sse(): Observable<any> {
  //   return this.postCreatedSubject.asObservable().pipe(
  //     map(
  //       (post) =>
  //         ({
  //           type: 'postCreated', // Specify the event name
  //           data: post,
  //         }) as MessageEvent,
  //     ),
  //   );
  // }

  @Get('/:id/events')
  sendEvents(@Res() res: Response) {
    try {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders(); // flush the headers to establish SSE with client

      this.eventEmitter.on('blogCreated', (data) => {
        const response = {
          event: 'postCreated',
          data,
        };
        console.log('data====>>', response);

        res.write(JSON.stringify(response));

        return response;

        // res.write(JSON.stringify(response));
        // res.write(`data: ${JSON.stringify(data)}\n\n`);
      });
    } catch (error) {
      console.log('error===', error);
    }
  }
}
