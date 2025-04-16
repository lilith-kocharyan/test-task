import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mockToken'),
            sign: jest.fn().mockReturnValue('mockToken'),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            getPool: jest.fn().mockReturnValue({
              query: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      age: 25,
    };

    it('should register a new user successfully', async () => {
      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rowCount: 0 }) // Email check
        .mockResolvedValueOnce({
          rows: [
            {
              id: '1',
              first_name: 'Test',
              last_name: 'User',
              age: 25,
              email: 'test@example.com',
            },
          ],
        }); // Insert user

      const result = await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(result.user).toEqual({
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        age: 25,
        email: 'test@example.com',
      });
      expect(result.token).toBe('mockToken');
    });

    it('should throw BadRequestException if email is already in use', async () => {
      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        first_name: 'Test',
        last_name: 'User',
        age: 25,
      };

      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUser],
      });

      const result = await authService.login(loginDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result.user).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        age: 25,
      });
      expect(result.access_token).toBe('mockToken');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockUser],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
