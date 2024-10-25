import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import RequestUtil from '../../utils/request.util';
import SecurityUtil from '../../utils/security.util';
import { UserAvatar } from './entities/user-avatar.entity';
import { UserAvatarRepository } from './repository/user-avatar.repository';

@Injectable()
export class UserAvatarService {
  private readonly uploadPath = path.join(__dirname, '..', '..', 'avatars');

  constructor(private readonly userAvatarRepository: UserAvatarRepository) {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async getUserAvatar(userId: string): Promise<string> {
    const avatar = await this.userAvatarRepository.findOne({ userId });
    let fileBase64: string;

    if (avatar) {
      fileBase64 = avatar.fileBase64;
      return fileBase64;
    }

    const avatarUrl = `https://reqres.in/img/faces/${userId}-image.jpg`;
    const imageBuffer = await this.fetchImage(avatarUrl);
    const hash = this.computeHash();
    const filePath = await this.saveImageToFileSystem(userId, imageBuffer);

    fileBase64 = imageBuffer.toString('base64');

    await this.userAvatarRepository.create({
      userId,
      hash,
      filePath,
      fileBase64,
    });

    return fileBase64;
  }

  async deleteUserAvatar(userId: string): Promise<UserAvatar> {
    const userAvatar = await this.getUserAvatarOrThrow(userId);

    // delete file from file system
    fs.unlinkSync(userAvatar?.filePath);

    // delete entry from db
    return await this.userAvatarRepository.findOneAndDelete({
      userId: userId,
    });
  }

  async getUserAvatarOrThrow(userId: string): Promise<UserAvatar> {
    const userAvatar = await this.userAvatarRepository.findOne({
      userId: userId,
    });
    if (!userAvatar) {
      throw new NotFoundException('User Avatar not found');
    }
    return userAvatar;
  }

  private computeHash(): string {
    return SecurityUtil.randomInt(15).toString();
  }

  private async saveImageToFileSystem(
    userId: string,
    imageBuffer: Buffer,
  ): Promise<string> {
    const filePath = join(__dirname, '..', '..', 'avatars', `${userId}.png`);

    fs.writeFileSync(filePath, imageBuffer);
    return filePath;
  }

  private async fetchImage(url: string): Promise<Buffer> {
    try {
      const response = await RequestUtil.makeGetRequest(url, {
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data, 'binary');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch image',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
