import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseInitService } from './database/database-init.service';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';
import { DatabaseService } from './database/database.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    FriendsModule,
  ],
  controllers: [AppController],
  providers: [DatabaseService, DatabaseInitService],
  exports: [DatabaseService],
})
export class AppModule {}
