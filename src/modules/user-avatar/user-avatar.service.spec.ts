import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { join } from 'path';
import SecurityUtil from '../../utils/security.util';
import { Types } from 'mongoose';
import { UserAvatar } from './entities/user-avatar.entity';
import { UserAvatarRepository } from './repository/user-avatar.repository';
import { UserAvatarService } from './user-avatar.service';
import RequestUtil from '../../utils/request.util';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

jest.mock('fs');
jest.mock('../../utils/security.util');
jest.mock('../../utils/request.util');
(SecurityUtil.randomInt as jest.Mock).mockReturnValue('123453425362736');

const mockedHash = '123453425362736';
const userId = '1';
const mockUserAvatar = {
  _id: expect.any(Types.ObjectId),
  userId,
  filePath: 'user/dist/avatars/1.png',
  fileBase64: 'hiwofhnoifkewopl',
  hash: mockedHash,
};

describe('UserAvatarService', () => {
  let service: UserAvatarService;
  let userAvatarRepository: UserAvatarRepository;

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
    it('should return the avatar from the database if it exists', async () => {
      const mockAvatar = { userId, fileBase64: 'e7q097r9820378' };

      (userAvatarRepository.findOne as jest.Mock).mockResolvedValue(mockAvatar);

      const result = await service.getUserAvatar(userId);

      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({ userId });
      expect(result).toEqual('e7q097r9820378');
    });

    it('should fetch, save, and return base64-encoded avatar if not found in the database', async () => {
      const userId = '2';
      const avatarUrl = `https://reqres.in/img/faces/${userId}-image.jpg`;
      const imageBuffer = Buffer.from('image-data');
      const mockFilePath = join(
        __dirname,
        '..',
        '..',
        'avatars',
        `${userId}.png`,
      );
      const mockAvatar = {
        _id: expect.any(Types.ObjectId),
        userId,
        hash: mockedHash,
        filePath: mockFilePath,
        fileBase64: imageBuffer.toString('base64'),
      };

      (userAvatarRepository.findOne as jest.Mock).mockResolvedValue(null);
      (RequestUtil.makeGetRequest as jest.Mock).mockResolvedValue({
        data: imageBuffer,
      });

      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      (userAvatarRepository.create as jest.Mock).mockResolvedValue(mockAvatar);

      const result = await service.getUserAvatar(userId);

      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({ userId });
      expect(RequestUtil.makeGetRequest).toHaveBeenCalledWith(avatarUrl, {
        responseType: 'arraybuffer',
      });
      expect(SecurityUtil.randomInt).toHaveBeenCalledWith(15);
      expect(fs.writeFileSync).toHaveBeenCalledWith(mockFilePath, imageBuffer);
      expect(userAvatarRepository.create).toHaveBeenCalledWith(mockAvatar);
      expect(result).toEqual(mockAvatar.fileBase64);
    });

    it('should throw an error if fetching the image fails', async () => {
      const userId = '1';

      (userAvatarRepository.findOne as jest.Mock).mockResolvedValue(null);
      (RequestUtil.makeGetRequest as jest.Mock).mockRejectedValue(
        new Error('Failed to fetch image'),
      );

      await expect(service.getUserAvatar(userId)).rejects.toThrow(
        'Failed to fetch image',
      );
    });

    describe('private methods', () => {
      it('computeHash should compute the correct hash', () => {
        expect(SecurityUtil.randomInt).toHaveBeenCalledWith(15);

        const value = service['computeHash']();

        expect(SecurityUtil.randomInt).toHaveBeenCalledWith(15);
        expect(value).toEqual(mockedHash);
      });

      it('saveImageToFileSystem should save the image and return the file path', async () => {
        const userId = '1';
        const imageBuffer = Buffer.from('imageData');
        const expectedFilePath = join(
          __dirname,
          '..',
          '..',
          'avatars',
          `${userId}.png`,
        );

        (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

        const result = await service['saveImageToFileSystem'](
          userId,
          imageBuffer,
        );

        expect(fs.writeFileSync).toHaveBeenCalledWith(
          expectedFilePath,
          imageBuffer,
        );
        expect(result).toEqual(expectedFilePath);
      });

      it('fetchImage should fetch the image from the URL', async () => {
        const url = 'http://example.com/image.png';
        const mockImageBuffer = Buffer.from('imageData');

        (RequestUtil.makeGetRequest as jest.Mock).mockResolvedValue({
          data: mockImageBuffer,
        });

        const result = await service['fetchImage'](url);

        expect(RequestUtil.makeGetRequest).toHaveBeenCalledWith(url, {
          responseType: 'arraybuffer',
        });
        expect(result).toEqual(mockImageBuffer);
      });
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete the file and remove the entry from the database', async () => {
      const mockDeletedUserAvatar = { userId, filePath: 'path/to/file' };

      jest
        .spyOn(service, 'getUserAvatarOrThrow')
        .mockResolvedValue(mockUserAvatar);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
      (userAvatarRepository.findOneAndDelete as jest.Mock).mockResolvedValue(
        mockDeletedUserAvatar,
      );

      const result = await service.deleteUserAvatar(userId);

      expect(service.getUserAvatarOrThrow).toHaveBeenCalledWith(userId);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockUserAvatar.filePath);
      expect(userAvatarRepository.findOneAndDelete).toHaveBeenCalledWith({
        userId,
      });
      expect(result).toEqual(mockDeletedUserAvatar);
    });

    it('should throw NotFoundException when avatar with Id does not exist in the database', async () => {
      mockUserAvatarRepository.findOne.mockResolvedValueOnce(null);
      jest
        .spyOn(service, 'getUserAvatarOrThrow')
        .mockRejectedValue(new NotFoundException('User Avatar not found'));

      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(userAvatarRepository.findOne).toHaveBeenCalledWith({
        userId,
      });
    });

    it('should throw an error if file deletion fails', async () => {
      const fileDeletionError = new Error('File deletion failed');

      jest
        .spyOn(service, 'getUserAvatarOrThrow')
        .mockResolvedValue(mockUserAvatar);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw fileDeletionError;
      });

      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
        'File deletion failed',
      );

      expect(service.getUserAvatarOrThrow).toHaveBeenCalledWith(userId);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockUserAvatar.filePath);
    });
  });
});
