import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersPurgeService } from './users-purge.service';
import {
  User, Planet, FocusSession, SocialUsage,
  AppLimit, DailyMission, XPHistory, MoodHistory, Notification,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Planet, FocusSession, SocialUsage,
      AppLimit, DailyMission, XPHistory, MoodHistory, Notification,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersPurgeService],
  exports: [UsersService, UsersPurgeService],
})
export class UsersModule {}
