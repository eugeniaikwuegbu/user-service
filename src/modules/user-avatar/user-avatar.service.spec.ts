import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { join } from 'path';
import SecurityUtil from '../../utils/security.util';
import { User } from '../users/entities/user.entity';
import { UserAvatar } from './entities/user-avatar.entity';
import { UserAvatarRepository } from './repository/user-avatar.repository';
import { UserAvatarService } from './user-avatar.service';

jest.mock('fs');
jest.mock('../../utils/security.util');

describe('UserAvatarService', () => {
  let service: UserAvatarService;
  let userAvatarRepository;

  const mockUserAvatarRepository = {
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAvatarService,
        UserAvatarRepository,
        {
          provide: getModelToken(UserAvatar.name),
          useValue: mockUserAvatarRepository,
        },
      ],
    }).compile();

    service = module.get<UserAvatarService>(UserAvatarService);
    userAvatarRepository = module.get(getModelToken(UserAvatar.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserAvatar', () => {
    it('should return user avatar when user exists', async () => {
      const userId = '66880c45f1a095dbb75a2341';
      const userAvatar = { fileBase64: 'base64string' };

      mockUserAvatarRepository.findOne.mockResolvedValue(userAvatar);

      const result = await service.getUserAvatar(userId);
      expect(result).toEqual({ fileBase64: userAvatar.fileBase64 });
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({
        user: userId,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = '66880c45f1a095dbb75a2341';

      mockUserAvatarRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserAvatar(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({
        user: userId,
      });
    });

    it('should throw NotFoundException with correct message when user does not exist', async () => {
      const userId = '6688082b24439dac4526ec15';

      mockUserAvatarRepository.findOne.mockResolvedValue(null);

      try {
        await service.getUserAvatar(userId);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe('User Avatar not found');
      }
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({
        user: userId,
      });
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete user avatar successfully', async () => {
      const userId = '6688082b24439dac4526ec15';
      const userAvatar = { file: { path: 'path/to/file' }, user: userId };
      const deletedAvatar = { user: userId };

      mockUserAvatarRepository.findOne.mockResolvedValue(userAvatar);
      mockUserAvatarRepository.findOneAndDelete.mockResolvedValue(
        deletedAvatar,
      );
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});

      const result = await service.deleteUserAvatar(userId);

      expect(result).toEqual(deletedAvatar);
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({
        user: userId,
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith(userAvatar.file.path);
      expect(userAvatarRepository.findOneAndDelete).toHaveBeenCalledWith({
        user: userId,
      });
    });

    it('should throw NotFoundException when user avatar does not exist', async () => {
      const userId = '6688082b24439dac4526ec15';

      mockUserAvatarRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({
        user: userId,
      });
    });

    it('should handle file deletion error', async () => {
      const userId = '6688082b24439dac4526ec15';
      const userAvatar = { file: { path: 'path/to/file' }, user: userId };

      mockUserAvatarRepository.findOne.mockResolvedValue(userAvatar);
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {
        throw new Error('File deletion error');
      });

      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
        'File deletion error',
      );
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({
        user: userId,
      });
      expect(fs.unlinkSync).toHaveBeenCalledWith(userAvatar.file.path);
    });
  });

  describe('saveFile', () => {
    it('should save the file successfully', async () => {
      const file: Express.Multer.File = {
        originalname: 'avatar.png',
        buffer: Buffer.from('file content'),
      } as any;
      const user = { _id: '6688082b24439dac4526ec15' } as unknown as User;
      const filePath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        file.originalname,
      );
      const hash = '123456473827364';
      const base64 = 'base64string';

      mockUserAvatarRepository.findOne.mockResolvedValue(null);
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
      jest.spyOn(SecurityUtil, 'randomInt').mockReturnValue(parseInt(hash));
      jest.spyOn(SecurityUtil, 'toBase64').mockReturnValue(base64);
      mockUserAvatarRepository.create.mockResolvedValue({});

      const result = await service.saveFile(file, user);

      expect(result).toEqual({ base64 });
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({ user });
      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, file.buffer);
      expect(SecurityUtil.randomInt).toHaveBeenCalledWith(15);
      expect(SecurityUtil.toBase64).toHaveBeenCalledWith(JSON.stringify(file));

      expect(userAvatarRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user,
          file,
          hash,
          fileBase64: base64,
        }),
      );
    });

    it('should throw ConflictException if user avatar already exists', async () => {
      const file: Express.Multer.File = {
        originalname: 'avatar.png',
        buffer: Buffer.from('file content'),
      } as any;
      const user = { _id: '6688082b24439dac4526ec15' } as unknown as User;

      mockUserAvatarRepository.findOne.mockResolvedValue({});

      await expect(service.saveFile(file, user)).rejects.toThrow(
        ConflictException,
      );
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({ user });
    });

    it('should handle file save error', async () => {
      const file: Express.Multer.File = {
        originalname: 'avatar.png',
        buffer: Buffer.from('file content'),
      } as any;
      const user = { _id: '6688082b24439dac4526ec15' } as unknown as User;

      const filePath = join(
        __dirname,
        '..',
        '..',
        'uploads',
        file.originalname,
      );

      mockUserAvatarRepository.findOne.mockResolvedValue(null);
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('File save error');
      });

      await expect(service.saveFile(file, user)).rejects.toThrow(
        'File save error',
      );
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({ user });
      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, file.buffer);
    });
  });
});
