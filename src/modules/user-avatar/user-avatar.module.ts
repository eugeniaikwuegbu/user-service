import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../configurations/database';
import { UserAvatarSchemaDefinition } from './entities/user-avatar.entity';
import { UserAvatarRepository } from './repository/user-avatar.repository';
import { UserAvatarService } from './user-avatar.service';

@Module({
  imports: [DatabaseModule.forFeature([UserAvatarSchemaDefinition])],
  providers: [UserAvatarService, UserAvatarRepository],
  exports: [UserAvatarRepository, UserAvatarService],
})
export class UserAvatarModule {}
