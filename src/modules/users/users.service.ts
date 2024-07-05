import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { NotificationService } from '../../modules/notifications/notification.service';
import { UserAvatar } from '../user-avatar/entities/user-avatar.entity';
import { UserAvatarService } from '../user-avatar/user-avatar.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAvatarService: UserAvatarService,
    private readonly notificationService: NotificationService,
  ) {}

  async createUser(createUserDTO: CreateUserDTO) {
    await this.throwIfUserExists(createUserDTO);

    const newUser = await this.userRepository.create({ ...createUserDTO });

    // upload avatar to fs
    const savedFile = await this.userAvatarService.saveFile(
      createUserDTO?.avatar,
      newUser,
    );

    await this.notificationService.sendWelcomeEmail(
      newUser?.email,
      `${newUser.firstName} ${newUser.lastName}`,
    );

    return { user: newUser, avatar: savedFile.base64 };
  }

  async getUserById(userId: string): Promise<User> {
    return await this.getUserOrThrow(userId);
  }

  async deleteUserAvatar(
    userId: string,
  ): Promise<{ user: User; userAvatar: UserAvatar }> {
    const user = await this.getUserOrThrow(userId);
    const userAvatar = await this.userAvatarService.deleteUserAvatar(userId);

    return {
      user,
      userAvatar,
    };
  }

  async getUserAvatar(userId: string): Promise<{ fileBase64: string }> {
    return await this.userAvatarService.getUserAvatar(userId);
  }

  private async throwIfUserExists(createUserDTO: CreateUserDTO) {
    const userExists = await this.userRepository.findOne({
      email: createUserDTO.email,
    });

    if (userExists) {
      throw new UnprocessableEntityException('Account already exists.');
    }
  }

  private async getUserOrThrow(userId: string) {
    const user: UserDocument = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user;
  }
}
