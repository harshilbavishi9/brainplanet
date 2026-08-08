import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import {
  User, Planet, FocusSession, SocialUsage,
  AppLimit, DailyMission, XPHistory, MoodHistory, Notification,
} from './database/entities';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlanetModule } from './modules/planet/planet.module';
import { FocusSessionsModule } from './modules/focus-sessions/focus-sessions.module';
import { SocialUsageModule } from './modules/social-usage/social-usage.module';
import { MissionsModule } from './modules/missions/missions.module';
import { RewardsModule } from './modules/rewards/rewards.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';

@Module({
  controllers: [AppController],
  imports: [
    // ── Config ──────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── Database ─────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [
          User, Planet, FocusSession, SocialUsage,
          AppLimit, DailyMission, XPHistory, MoodHistory, Notification,
        ],
        synchronize: true, // Enabled for MVP
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('NODE_ENV') === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
    }),

    // ── Rate Limiting ─────────────────────────────────────────────
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // ── Scheduler (cron jobs) ─────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Feature Modules ───────────────────────────────────────────
    AuthModule,
    UsersModule,
    PlanetModule,
    FocusSessionsModule,
    SocialUsageModule,
    MissionsModule,
    RewardsModule,
    AnalyticsModule,
    NotificationsModule,
    WebsocketsModule,
  ],
})
export class AppModule { }
