import { FriendRequestStatus } from '../enum/request-status.enum';

export interface IFriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
}
