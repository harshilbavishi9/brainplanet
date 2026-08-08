import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FocusSessionsController } from './focus-sessions.controller';
import { FocusSessionsService } from './focus-sessions.service';
import { FocusSession, DailyMission } from '../../database/entities';
import { UsersModule } from '../users/users.module';
import { PlanetModule } from '../planet/planet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FocusSession, DailyMission]),
    UsersModule,
    PlanetModule,
  ],
  controllers: [FocusSessionsController],
  providers: [FocusSessionsService],
  exports: [FocusSessionsService],
})
export class FocusSessionsModule {}

