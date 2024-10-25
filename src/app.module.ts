import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAvatarModule } from './modules/user-avatar/user-avatar.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    UsersModule,
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        SENDER_NAME: Joi.string().required(),
        SENDER_EMAIL: Joi.string().required(),
      }),
    }),
    UserAvatarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
