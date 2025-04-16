import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FriendRequestStatus } from './enum/request-status.enum';

@Injectable()
export class FriendsService {
  constructor(private readonly db: DatabaseService) {}

  // Send a new friend request
  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new Error('You cannot send a friend request to yourself.');
    }

    // Check if already exists
    const existing = await this.db.getPool().query(
      `SELECT * FROM friends
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)`,
      [senderId, receiverId],
    );

    if (existing.rows.length) {
      throw new ConflictException(
        'Friend request already exists or you are already friends.',
      );
    }

    const result = await this.db.getPool().query(
      `INSERT INTO friends (sender_id, receiver_id, status, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [senderId, receiverId, FriendRequestStatus.PENDING],
    );

    return result.rows[0];
  }

  // Accept or decline a request
  async updateFriendRequestStatus(
    userId: string,
    requestId: string,
    status: FriendRequestStatus,
  ) {
    const result = await this.db
      .getPool()
      .query(`SELECT * FROM friends WHERE id = $1`, [requestId]);

    const request = result.rows[0];
    if (!request) {
      throw new Error('Friend request not found.');
    }

    if (request.receiver_id !== userId) {
      throw new Error('You can only respond to friend requests sent to you.');
    }

    const updated = await this.db
      .getPool()
      .query(
        `UPDATE friends SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [FriendRequestStatus[status], requestId],
      );

    return updated.rows[0];
  }

  // Get all incoming pending requests
  async getPendingRequests(userId: string) {
    const result = await this.db.getPool().query(
      `SELECT f.id, f.sender_id, f.created_at, u.first_name, u.last_name, u.email, u.age
       FROM friends f
       JOIN users u ON f.sender_id = u.id
       WHERE f.receiver_id = $1 AND f.status = $2`,
      [userId, FriendRequestStatus.PENDING],
    );

    return result.rows.map((row) => ({
      requestId: row.id,
      sender: {
        id: row.sender_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        age: row.age,
      },
      createdAt: row.created_at,
    }));
  }

  // Get accepted friends list
  async getFriends(userId: string) {
    const result = await this.db.getPool().query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.age
       FROM friends f
       JOIN users u ON u.id = CASE
         WHEN f.sender_id = $1 THEN f.receiver_id
         ELSE f.sender_id
       END
       WHERE (f.sender_id = $1 OR f.receiver_id = $1)
         AND f.status = $2`,
      [userId, FriendRequestStatus.ACCEPTED],
    );

    return result.rows;
  }
}
