import { IsEnum } from 'class-validator';
import { FriendRequestStatus } from '../enum/request-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFriendStatusDto {
  @ApiProperty()
  @IsEnum(FriendRequestStatus)
  status: FriendRequestStatus;
}
