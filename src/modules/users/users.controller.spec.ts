import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UserController', () => {
  let controller: UsersController;

  const mockUsersService = {
    createUser: jest.fn(),
    getUserById: jest.fn(),
  };

  const mockUser = {
    id: '12345',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockAvatar = {
    originalname: 'avatar.png',
    buffer: Buffer.from('file content'),
  } as Express.Multer.File;

  const createUserDTO: CreateUserDTO = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: mockAvatar,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user and return the response', async () => {
      mockUsersService.createUser.mockResolvedValue({
        user: mockUser,
        avatar: 'base64string',
      });

      const result = await controller.createUser(createUserDTO, mockAvatar);

      expect(result).toEqual({
        message: 'User created',
        response: { user: mockUser, avatar: 'base64string' },
      });
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...createUserDTO,
      });
    });

    it('should handle errors and throw HttpException', async () => {
      const error = new Error('Operation failed');
      mockUsersService.createUser.mockRejectedValue(error);

      await expect(
        controller.createUser(createUserDTO, mockAvatar),
      ).rejects.toThrow(HttpException);
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...createUserDTO,
      });

      try {
        await controller.createUser(createUserDTO, mockAvatar);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Operation failed');
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should handle specific error status', async () => {
      const error = new HttpException('Conflict', HttpStatus.CONFLICT);
      mockUsersService.createUser.mockRejectedValue(error);

      await expect(
        controller.createUser(createUserDTO, mockAvatar),
      ).rejects.toThrow(HttpException);
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...createUserDTO,
      });

      try {
        await controller.createUser(createUserDTO, mockAvatar);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Conflict');
        expect(e.status).toBe(HttpStatus.CONFLICT);
      }
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID', async () => {
      mockUsersService.getUserById.mockResolvedValue(mockUser);

      const result = await controller.getUserById(mockUser.id);

      expect(result).toEqual({
        message: 'User fetched successfully',
        response: mockUser,
      });
      expect(mockUsersService.getUserById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle errors and throw HttpException', async () => {
      const error = new Error('User not found');
      mockUsersService.getUserById.mockRejectedValue(error);

      await expect(controller.getUserById(mockUser.id)).rejects.toThrow(
        HttpException,
      );
      expect(mockUsersService.getUserById).toHaveBeenCalledWith(mockUser.id);

      try {
        await controller.getUserById(mockUser.id);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('User not found');
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
