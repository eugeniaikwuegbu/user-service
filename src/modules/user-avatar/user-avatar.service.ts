import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import SecurityUtil from '../../utils/security.util';
import { User } from '../users/entities/user.entity';
import { UserAvatar } from './entities/user-avatar.entity';
import { UserAvatarRepository } from './repository/user-avatar.repository';
// const uploads = require('../../../uploads');

@Injectable()
export class UserAvatarService {
  private readonly uploadPath = path.join(__dirname, '..', '..', 'uploads');

  constructor(private readonly userAvatarRepository: UserAvatarRepository) {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async getUserAvatar(userId: string): Promise<{ fileBase64: string }> {
    const file = await this.getUserAvatarOrThrow(userId);
    return { fileBase64: file.fileBase64 };
  }

  async saveFile(
    file: Express.Multer.File,
    user: User,
  ): Promise<{ base64: string }> {
    // check if user has uploaded avatar before
    const userAvatar = await this.userAvatarRepository.findOne({
      user,
    });

    if (userAvatar) {
      throw new ConflictException('User avatar already exist');
    }

    const filePath = join(__dirname, '..', '..', 'uploads', file.originalname);
    file.path = filePath;

    // Save file to the server
    await fs.writeFileSync(filePath, file.buffer);

    // Generate hash
    const hash = SecurityUtil.randomInt(15).toString();

    // Convert file to base64
    const base64 = SecurityUtil.toBase64(JSON.stringify(file));

    // Create a new file document
    await this.userAvatarRepository.create({
      user,
      file,
      hash,
      fileBase64: base64,
    });

    return { base64 };
  }

  async deleteUserAvatar(userId): Promise<UserAvatar> {
    const userAvatar = await this.getUserAvatarOrThrow(userId);

    // delete file in server
    await fs.unlinkSync(userAvatar?.file?.path);

    // delete entry in db
    const deletedAvatar: UserAvatar =
      await this.userAvatarRepository.findOneAndDelete({
        user: userId,
      });

    return deletedAvatar;
  }

  private async getUserAvatarOrThrow(userId): Promise<UserAvatar> {
    const userAvatar = await this.userAvatarRepository.findOne({
      user: userId,
    });
    if (!userAvatar) {
      throw new NotFoundException('User Avatar not found');
    }
    return userAvatar;
  }
}
