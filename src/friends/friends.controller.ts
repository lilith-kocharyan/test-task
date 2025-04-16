import {
  Controller,
  Post,
  Param,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateFriendStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/auth-user.decorator';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  // Send a friend request
  @Post(':receiverId')
  async sendFriendRequest(
    @AuthUser() user: any,
    @Param('receiverId') receiverId: string,
  ) {
    return this.friendsService.sendFriendRequest(user.id, receiverId);
  }

  // Accept or Decline a request
  @Patch(':requestId')
  async updateStatus(
    @AuthUser() user: any,
    @Param('requestId') requestId: string,
    @Body() body: UpdateFriendStatusDto,
  ) {
    return this.friendsService.updateFriendRequestStatus(
      user.id,
      requestId,
      body.status,
    );
  }

  // Get incoming (pending) friend requests
  @Get('requests')
  async getPendingRequests(@AuthUser() user: any) {
    return this.friendsService.getPendingRequests(user.id);
  }

  // Optional: Get current user's friends (accepted ones)
  @Get()
  async getFriendsList(@AuthUser() user: any) {
    return this.friendsService.getFriends(user.id);
  }
}
