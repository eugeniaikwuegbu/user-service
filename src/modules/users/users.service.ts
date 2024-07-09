import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { NotificationService } from '../notifications/notification.service';
import { UserAvatar } from '../user-avatar/entities/user-avatar.entity';
import { UserAvatarService } from '../user-avatar/user-avatar.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserRepository } from './repository/user.repository';
import RequestUtil from '../../utils/request.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAvatarService: UserAvatarService,
    private readonly notificationService: NotificationService,
  ) {}

  async createUser(createUserDTO: CreateUserDTO) {
    await this.throwIfUserExists(createUserDTO);

    const user = await this.userRepository.create({ ...createUserDTO });

    await this.notificationService.sendWelcomeEmail(
      user?.email,
      `${user.firstName} ${user.lastName}`,
    );

    return { user };
  }

  async getUserById(userId: string) {
    const response = await RequestUtil.makeGetRequest(
      `https://reqres.in/api/users/${userId}`,
    );
    if (response.status === HttpStatus.OK) {
      return response.data.data;
    } else {
      throw new HttpException('Error fetching user', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUserAvatar(userId: string): Promise<UserAvatar> {
    return await this.userAvatarService.deleteUserAvatar(userId);
  }

  async getUserAvatar(userId: string): Promise<string> {
    return await this.userAvatarService.getUserAvatar(userId);
  }

  private async throwIfUserExists(createUserDTO: CreateUserDTO) {
    const userExists = await this.userRepository.findOne({
      email: createUserDTO.email,
    });

    if (userExists) {
      throw new ConflictException(`User with email already exists.`);
    }
  }
}
