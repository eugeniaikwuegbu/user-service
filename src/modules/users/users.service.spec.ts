import { ConflictException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { NotificationService } from '../notifications/notification.service';
import { UserAvatar } from '../user-avatar/entities/user-avatar.entity';
import { UserAvatarRepository } from '../user-avatar/repository/user-avatar.repository';
import { UserAvatarService } from '../user-avatar/user-avatar.service';
import { User } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { UsersService } from './users.service';

jest.mock('../user-avatar/user-avatar.service');
jest.mock('../notifications/notification.service');

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
  };

  const mockUserAvatarRepository = {
    findOne: jest.fn(),
  };

  const mockUserAvatarService = {
    saveFile: jest.fn(),
    deleteUserAvatar: jest.fn(),
    getUserAvatar: jest.fn(),
  };

  const mockNotificationService = {
    sendWelcomeEmail: jest.fn(),
  };

  const createUserDTO = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: {
      originalname: 'avatar.png',
      buffer: Buffer.from('file content'),
    },
  };

  const userId = new Types.ObjectId().toHexString();
  const mockUser = {
    _id: userId,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockUserAvatar = {
    _id: new Types.ObjectId().toHexString(),
    user: userId,
    file: {
      originalname: 'avatar.png',
      buffer: Buffer.from('file content'),
    },
    fileBase64: 'base64string',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UserRepository,
        UserAvatarRepository,
        {
          provide: getModelToken(UserAvatar.name),
          useValue: mockUserAvatarRepository,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserRepository,
        },
        {
          provide: UserAvatarService,
          useValue: mockUserAvatarService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user, upload avatar, and send a welcome email', async () => {
      const savedUser = { ...createUserDTO, _id: new Types.ObjectId() };
      const savedFile = { base64: 'base64string' };

      mockUserRepository.create.mockResolvedValue(savedUser);
      mockUserAvatarService.saveFile.mockResolvedValue(savedFile);
      mockNotificationService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await service.createUser(createUserDTO);

      expect(result).toEqual({
        user: { ...createUserDTO, _id: expect.any(Types.ObjectId) },
        avatar: savedFile.base64,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createUserDTO,
          _id: expect.any(Types.ObjectId),
        }),
      );
      expect(mockUserAvatarService.saveFile).toHaveBeenCalledWith(
        createUserDTO.avatar,
        savedUser,
      );
      expect(mockNotificationService.sendWelcomeEmail).toHaveBeenCalledWith(
        savedUser.email,
        `${savedUser.firstName} ${savedUser.lastName}`,
      );
    });

    it('should throw a ConflictException if the user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({});

      await expect(service.createUser(createUserDTO)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: createUserDTO.email,
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserAvatar', () => {
    it('should return user avatar', async () => {
      mockUserAvatarService.getUserAvatar.mockResolvedValue(mockUserAvatar);

      const result = await service.getUserAvatar(userId);

      expect(result).toEqual(mockUserAvatar);
      expect(mockUserAvatarService.getUserAvatar).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user avatar is not found', async () => {
      mockUserAvatarService.getUserAvatar.mockRejectedValue(
        new NotFoundException('User Avatar not found'),
      );

      await expect(service.getUserAvatar(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserAvatarService.getUserAvatar).toHaveBeenCalledWith(userId);
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete user avatar and return user and user avatar', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserAvatarService.deleteUserAvatar.mockResolvedValue(mockUserAvatar);

      const result = await service.deleteUserAvatar(userId);

      expect(result).toEqual({ user: mockUser, userAvatar: mockUserAvatar });
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserAvatarService.deleteUserAvatar).toHaveBeenCalledWith(
        userId,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should handle errors during avatar deletion', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserAvatarService.deleteUserAvatar.mockRejectedValue(
        new Error('Deletion error'),
      );

      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
        'Deletion error',
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserAvatarService.deleteUserAvatar).toHaveBeenCalledWith(
        userId,
      );
    });
  });
});
