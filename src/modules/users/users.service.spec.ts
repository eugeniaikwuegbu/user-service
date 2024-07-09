import { ConflictException, HttpException, HttpStatus } from '@nestjs/common';
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
import { CreateUserDTO } from './dto/create-user.dto';
import RequestUtil from '../../utils/request.util';

jest.mock('../user-avatar/user-avatar.service');
jest.mock('../notifications/notification.service');
jest.mock('../../utils/request.util');

describe('UsersService', () => {
  let userService: UsersService;
  let userAvatarService: UserAvatarService;

  const mockUserRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserAvatarRepository = {
    findOne: jest.fn(),
  };

  const mockUserAvatarService = {
    deleteUserAvatar: jest.fn(),
    getUserAvatar: jest.fn(),
  };

  const mockNotificationService = {
    sendWelcomeEmail: jest.fn(),
  };

  const createUserDTO: CreateUserDTO = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UserRepository,
        UserAvatarRepository,
        { provide: getModelToken(User.name), useValue: mockUserRepository },
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

    userService = module.get<UsersService>(UsersService);
    userAvatarService = module.get<UserAvatarService>(UserAvatarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw a ConflictException if the user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({
        _id: 1,
        email: 'test@example.com',
      });

      await expect(userService.createUser(createUserDTO)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        email: createUserDTO.email,
      });
    });

    it('should create a new user if they do not exist', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.create.mockResolvedValueOnce({
        _id: expect.any(Types.ObjectId),
        ...createUserDTO,
      });

      const result = await userService.createUser(createUserDTO);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createUserDTO,
          _id: expect.any(Types.ObjectId),
        }),
      );
      expect(result.user).toEqual({
        _id: expect.any(Types.ObjectId),
        ...createUserDTO,
      });
    });

    it('should send a welcome email after creating the user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.create.mockResolvedValueOnce({
        _id: expect.any(Types.ObjectId),
        ...createUserDTO,
      });

      await userService.createUser(createUserDTO);

      expect(mockNotificationService.sendWelcomeEmail).toHaveBeenCalledWith(
        createUserDTO.email,
        `${createUserDTO.firstName} ${createUserDTO.lastName}`,
      );
    });
  });

  describe('getUserById', () => {
    it('should return user data if response status is 200 OK', async () => {
      const response = {
        status: HttpStatus.OK,
        data: {
          data: {
            id: 1,
            email: 'george.bluth@reqres.in',
            first_name: 'George',
            last_name: 'Bluth',
            avatar: 'https://reqres.in/img/faces/1-image.jpg',
          },
        },
      };

      (RequestUtil.makeGetRequest as jest.Mock).mockResolvedValue(response);

      const result = await userService.getUserById('1');

      expect(RequestUtil.makeGetRequest).toHaveBeenCalledWith(
        `https://reqres.in/api/users/1`,
      );
      expect(result).toEqual(response.data.data);
    });

    it('should throw HttpException if response status is not 200 OK', async () => {
      const mockResponse = {
        status: HttpStatus.BAD_REQUEST,
        data: null,
      };

      (RequestUtil.makeGetRequest as jest.Mock).mockResolvedValue(mockResponse);

      await expect(userService.getUserById('1')).rejects.toThrow(HttpException);
      expect(RequestUtil.makeGetRequest).toHaveBeenCalledWith(
        `https://reqres.in/api/users/1`,
      );
    });
  });

  describe('deleteUserAvatar', () => {
    it('should call userAvatarService.deleteUserAvatar with the correct userId', async () => {
      const mockUserAvatar = {
        _id: new Types.ObjectId().toHexString(),
        userId: 1,
        hash: '123454321234565',
        filePath: 'users/dist/avatars/1.png',
        fileBase64: 'base64string',
      };

      (userAvatarService.deleteUserAvatar as jest.Mock).mockResolvedValue(
        mockUserAvatar,
      );

      const result = await userService.deleteUserAvatar('1');

      expect(userAvatarService.deleteUserAvatar).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUserAvatar);
    });

    describe('getUserAvatar', () => {
      it('should call userAvatarService.getUserAvatar with the correct userId', async () => {
        const mockAvatarBase64 = 'base64-encoded-string';

        (userAvatarService.getUserAvatar as jest.Mock).mockResolvedValue(
          mockAvatarBase64,
        );

        const result = await userService.getUserAvatar('1');

        expect(userAvatarService.getUserAvatar).toHaveBeenCalledWith('1');
        expect(result).toEqual(mockAvatarBase64);
      });
    });
  });

  //  describe('createUser', () => {
  //    it('should create a new user, upload avatar, and send a welcome email', async () => {
  //      const savedUser = { ...createUserDTO, _id: new Types.ObjectId() };
  //      const savedFile = { base64: 'base64string' };
  //
  //      mockUserRepository.create.mockResolvedValue(savedUser);
  //      mockUserAvatarService.saveFile.mockResolvedValue(savedFile);
  //      mockNotificationService.sendWelcomeEmail.mockResolvedValue(undefined);
  //
  //      const result = await service.createUser(createUserDTO);
  //
  //      expect(result).toEqual({
  //        user: { ...createUserDTO, _id: expect.any(Types.ObjectId) },
  //        avatar: savedFile.base64,
  //      });
  //      expect(mockUserRepository.create).toHaveBeenCalledWith(
  //        expect.objectContaining({
  //          ...createUserDTO,
  //          _id: expect.any(Types.ObjectId),
  //        }),
  //      );
  //      expect(mockUserAvatarService.saveFile).toHaveBeenCalledWith(
  //        createUserDTO.avatar,
  //        savedUser,
  //      );
  //      expect(mockNotificationService.sendWelcomeEmail).toHaveBeenCalledWith(
  //        savedUser.email,
  //        `${savedUser.firstName} ${savedUser.lastName}`,
  //      );
  //    });
  //
  //    it('should throw a ConflictException if the user already exists', async () => {
  //      mockUserRepository.findOne.mockResolvedValue({});
  //
  //      await expect(service.createUser(createUserDTO)).rejects.toThrow(
  //        ConflictException,
  //      );
  //      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
  //        email: createUserDTO.email,
  //      });
  //    });
  //  });
  //
  //  describe('getUserById', () => {
  //    it('should return a user if found', async () => {
  //      mockUserRepository.findById.mockResolvedValue(mockUser);
  //
  //      const result = await service.getUserById(userId);
  //
  //      expect(result).toEqual(mockUser);
  //      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  //    });
  //
  //    it('should throw NotFoundException if user is not found', async () => {
  //      mockUserRepository.findById.mockResolvedValue(null);
  //
  //      await expect(service.getUserById(userId)).rejects.toThrow(
  //        NotFoundException,
  //      );
  //      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  //    });
  //  });
  //
  //  describe('getUserAvatar', () => {
  //    it('should return user avatar', async () => {
  //      mockUserAvatarService.getUserAvatar.mockResolvedValue(mockUserAvatar);
  //
  //      const result = await service.getUserAvatar(userId);
  //
  //      expect(result).toEqual(mockUserAvatar);
  //      expect(mockUserAvatarService.getUserAvatar).toHaveBeenCalledWith(userId);
  //    });
  //
  //    it('should throw NotFoundException when user avatar is not found', async () => {
  //      mockUserAvatarService.getUserAvatar.mockRejectedValue(
  //        new NotFoundException('User Avatar not found'),
  //      );
  //
  //      await expect(service.getUserAvatar(userId)).rejects.toThrow(
  //        NotFoundException,
  //      );
  //      expect(mockUserAvatarService.getUserAvatar).toHaveBeenCalledWith(userId);
  //    });
  //  });
  //
  //  describe('deleteUserAvatar', () => {
  //    it('should delete user avatar and return user and user avatar', async () => {
  //      mockUserRepository.findById.mockResolvedValue(mockUser);
  //      mockUserAvatarService.deleteUserAvatar.mockResolvedValue(mockUserAvatar);
  //
  //      const result = await service.deleteUserAvatar(userId);
  //
  //      expect(result).toEqual({ user: mockUser, userAvatar: mockUserAvatar });
  //      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  //      expect(mockUserAvatarService.deleteUserAvatar).toHaveBeenCalledWith(
  //        userId,
  //      );
  //    });
  //
  //    it('should throw NotFoundException if user is not found', async () => {
  //      mockUserRepository.findById.mockResolvedValue(null);
  //
  //      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
  //        NotFoundException,
  //      );
  //      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  //    });
  //
  //    it('should handle errors during avatar deletion', async () => {
  //      mockUserRepository.findById.mockResolvedValue(mockUser);
  //      mockUserAvatarService.deleteUserAvatar.mockRejectedValue(
  //        new Error('Deletion error'),
  //      );
  //
  //      await expect(service.deleteUserAvatar(userId)).rejects.toThrow(
  //        'Deletion error',
  //      );
  //      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  //      expect(mockUserAvatarService.deleteUserAvatar).toHaveBeenCalledWith(
  //        userId,
  //      );
  //    });
  //  });
});
