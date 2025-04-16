import { Test } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { DatabaseService } from '../database/database.service';
import { FriendRequestStatus } from './enum/request-status.enum';
import { ConflictException } from '@nestjs/common';

describe('FriendsService', () => {
  let friendsService: FriendsService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FriendsService,
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

    friendsService = moduleRef.get<FriendsService>(FriendsService);
    databaseService = moduleRef.get<DatabaseService>(DatabaseService);
  });

  describe('sendFriendRequest', () => {
    const senderId = '1';
    const receiverId = '2';

    it('should send a friend request successfully', async () => {
      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // Check existing
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'request1',
              sender_id: senderId,
              receiver_id: receiverId,
              status: FriendRequestStatus.PENDING,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        }); // Insert request

      const result = await friendsService.sendFriendRequest(
        senderId,
        receiverId,
      );

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        id: 'request1',
        sender_id: senderId,
        receiver_id: receiverId,
        status: FriendRequestStatus.PENDING,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
    });

    it('should throw error when sending request to self', async () => {
      await expect(
        friendsService.sendFriendRequest(senderId, senderId),
      ).rejects.toThrow('You cannot send a friend request to yourself.');
    });

    it('should throw ConflictException when request already exists', async () => {
      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'existingRequest',
            sender_id: senderId,
            receiver_id: receiverId,
            status: FriendRequestStatus.PENDING,
          },
        ],
      });

      await expect(
        friendsService.sendFriendRequest(senderId, receiverId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateFriendRequestStatus', () => {
    const userId = '2';
    const requestId = 'request1';
    const status = FriendRequestStatus.ACCEPTED;

    it('should update friend request status successfully', async () => {
      const mockRequest = {
        id: requestId,
        sender_id: '1',
        receiver_id: userId,
        status: FriendRequestStatus.PENDING,
      };

      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockRequest] }) // Get request
        .mockResolvedValueOnce({
          rows: [
            {
              ...mockRequest,
              status: FriendRequestStatus.ACCEPTED,
              updated_at: new Date(),
            },
          ],
        }); // Update request

      const result = await friendsService.updateFriendRequestStatus(
        userId,
        requestId,
        status,
      );

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(result.status).toBe(FriendRequestStatus.ACCEPTED);
    });

    it('should throw error when request not found', async () => {
      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await expect(
        friendsService.updateFriendRequestStatus(userId, requestId, status),
      ).rejects.toThrow('Friend request not found.');
    });

    it('should throw error when user is not the receiver', async () => {
      const mockRequest = {
        id: requestId,
        sender_id: '1',
        receiver_id: '3', // Different from userId
        status: FriendRequestStatus.PENDING,
      };

      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockRequest],
      });

      await expect(
        friendsService.updateFriendRequestStatus(userId, requestId, status),
      ).rejects.toThrow('You can only respond to friend requests sent to you.');
    });
  });

  describe('getPendingRequests', () => {
    const userId = '1';

    it('should get pending friend requests successfully', async () => {
      const mockRequests = [
        {
          id: 'request1',
          sender_id: '2',
          created_at: new Date(),
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          age: 25,
        },
      ];

      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: mockRequests,
      });

      const result = await friendsService.getPendingRequests(userId);

      expect(result).toEqual([
        {
          requestId: 'request1',
          sender: {
            id: '2',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            age: 25,
          },
          createdAt: expect.any(Date),
        },
      ]);
    });

    it('should return empty array when no pending requests', async () => {
      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await friendsService.getPendingRequests(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getFriends', () => {
    const userId = '1';

    it('should get friends list successfully', async () => {
      const mockFriends = [
        {
          id: '2',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          age: 25,
        },
      ];

      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: mockFriends,
      });

      const result = await friendsService.getFriends(userId);

      expect(result).toEqual([
        {
          id: '2',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          age: 25,
        },
      ]);
    });

    it('should return empty array when no friends', async () => {
      const mockPool = databaseService.getPool();
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await friendsService.getFriends(userId);

      expect(result).toEqual([]);
    });
  });
});
