import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { DatabaseService } from '../database/database.service';
import { FriendsController } from './friends.controller';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, DatabaseService],
})
export class FriendsModule {}
