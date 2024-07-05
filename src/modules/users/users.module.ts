import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../configurations/database';
import { LoggerModule } from '../../logger/logger.module';
import NotificationMicroService from '../../microservices/notification';
import { NotificationService } from '../notifications/notification.service';
import { UserAvatarSchemaDefinition } from '../user-avatar/entities/user-avatar.entity';
import { UserAvatarRepository } from '../user-avatar/repository/user-avatar.repository';
import { UserAvatarService } from '../user-avatar/user-avatar.service';
import { UserSchemaDefinition } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    DatabaseModule,
    LoggerModule,
    DatabaseModule.forFeature([
      UserSchemaDefinition,
      UserAvatarSchemaDefinition,
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    UserAvatarService,
    UserAvatarRepository,
    NotificationService,
    NotificationMicroService,
  ],
  exports: [
    UsersService,
    UserRepository,
    UserAvatarRepository,
    UserAvatarService,
  ],
})
export class UsersModule {}
