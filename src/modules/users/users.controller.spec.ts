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
    getUserAvatar: jest.fn(),
    deleteUserAvatar: jest.fn(),
  };

  const mockUser = {
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
      });

      const result = await controller.createUser(createUserDTO);

      expect(result).toEqual({
        message: 'User created',
        response: { user: mockUser },
      });
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...createUserDTO,
      });
    });

    it('should handle errors and throw HttpException', async () => {
      const error = new Error('Operation failed');
      mockUsersService.createUser.mockRejectedValue(error);

      await expect(controller.createUser(createUserDTO)).rejects.toThrow(
        HttpException,
      );
      expect(mockUsersService.createUser).toHaveBeenCalledWith({
        ...createUserDTO,
      });

      try {
        await controller.createUser(createUserDTO);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Operation failed');
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getUserById', () => {
    it('should return user data when service call is successful', async () => {
      const mockUserResponse = {
        id: 1,
        email: 'george.bluth@reqres.in',
        first_name: 'George',
        last_name: 'Bluth',
        avatar: 'https://reqres.in/img/faces/1-image.jpg',
      };

      const expectedResponse = {
        message: 'User fetched successfully',
        response: mockUserResponse,
      };

      (mockUsersService.getUserById as jest.Mock).mockResolvedValue(
        mockUserResponse,
      );

      const result = await controller.getUserById('1');

      expect(mockUsersService.getUserById).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException with correct message and status when service call fails', async () => {
      const errorMessage = 'Operation failed';
      const errorStatus = HttpStatus.BAD_REQUEST;
      const error = new HttpException(errorMessage, errorStatus);

      (mockUsersService.getUserById as jest.Mock).mockRejectedValue(error);

      try {
        await controller.getUserById('1');
      } catch (e) {
        expect(mockUsersService.getUserById).toHaveBeenCalledWith('1');
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Operation failed');
        expect(e.status).toEqual(400);
      }
    });
  });

  describe('getUserAvatar', () => {
    it('should return user avatar when service call is successful', async () => {
      const userId = '1';
      const mockAvatarBase64 = 'base64-encoded-string';
      const expectedResponse = {
        message: 'User avatar fetched',
        response: mockAvatarBase64,
      };

      (mockUsersService.getUserAvatar as jest.Mock).mockResolvedValue(
        mockAvatarBase64,
      );

      const result = await controller.getUserAvatar(userId);

      expect(mockUsersService.getUserAvatar).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException with correct message and status when service call fails', async () => {
      const errorMessage = 'User not found';
      const errorStatus = HttpStatus.NOT_FOUND;
      const error = new HttpException(errorMessage, errorStatus);

      (mockUsersService.getUserAvatar as jest.Mock).mockRejectedValue(error);

      try {
        await controller.getUserAvatar('1');
      } catch (e) {
        expect(mockUsersService.getUserAvatar).toHaveBeenCalledWith('1');
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toEqual(errorMessage);
        expect(e.getStatus()).toEqual(errorStatus);
      }
    });
  });

  describe('deleteUserAvatar', () => {
    it('should call usersService.deleteUserAvatar with the correct userId', async () => {
      const mockResponse = {
        _id: '',
        hash: '1125367172818291',
        userId: '1',
        filePath: 'users/dist/avatars/1.png',
        fileBase64: 'random-string',
      };
      const expectedResponse = {
        message: 'User avatar deleted',
        response: mockResponse,
      };

      (mockUsersService.deleteUserAvatar as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await controller.deleteUserAvatar('1');

      expect(mockUsersService.deleteUserAvatar).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResponse);
    });

    it('should throw HttpException with correct message and status when service call fails', async () => {
      const userId = '1';
      const errorMessage = 'User not found';
      const errorStatus = HttpStatus.NOT_FOUND;
      const error = new HttpException(errorMessage, errorStatus);

      (mockUsersService.deleteUserAvatar as jest.Mock).mockRejectedValue(error);

      try {
        await controller.deleteUserAvatar(userId);
      } catch (e) {
        expect(mockUsersService.deleteUserAvatar).toHaveBeenCalledWith(userId);
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toEqual(errorMessage);
        expect(e.getStatus()).toEqual(errorStatus);
      }
    });
  });
});
