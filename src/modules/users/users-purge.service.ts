import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import {
  User, Planet, FocusSession, SocialUsage,
  AppLimit, DailyMission, XPHistory, MoodHistory, Notification,
} from '../../database/entities';

@Injectable()
export class UsersPurgeService {
  private readonly logger = new Logger(UsersPurgeService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Planet) private readonly planetRepo: Repository<Planet>,
    @InjectRepository(FocusSession) private readonly focusRepo: Repository<FocusSession>,
    @InjectRepository(SocialUsage) private readonly usageRepo: Repository<SocialUsage>,
    @InjectRepository(AppLimit) private readonly limitRepo: Repository<AppLimit>,
    @InjectRepository(DailyMission) private readonly missionRepo: Repository<DailyMission>,
    @InjectRepository(XPHistory) private readonly xpRepo: Repository<XPHistory>,
    @InjectRepository(MoodHistory) private readonly moodRepo: Repository<MoodHistory>,
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAccountPurge() {
    this.logger.log('Checking for pending account deletions past 72h grace period...');
    const now = new Date();

    const expiredUsers = await this.userRepo.find({
      where: {
        isPendingDeletion: true,
        scheduledDeletionDate: LessThanOrEqual(now),
      },
    });

    if (!expiredUsers || expiredUsers.length === 0) {
      this.logger.log('No accounts eligible for deletion at this time.');
      return;
    }

    this.logger.log(`Found ${expiredUsers.length} account(s) ready for permanent deletion.`);

    for (const user of expiredUsers) {
      try {
        const userId = user.id;

        // Cascade delete user-related records
        await this.planetRepo.delete({ userId });
        await this.focusRepo.delete({ userId });
        await this.usageRepo.delete({ userId });
        await this.limitRepo.delete({ userId });
        await this.missionRepo.delete({ userId });
        await this.xpRepo.delete({ userId });
        await this.moodRepo.delete({ userId });
        await this.notifRepo.delete({ userId });

        // Delete user
        await this.userRepo.remove(user);

        this.logger.log(`Successfully purged user account: ${user.email} (ID: ${userId})`);
      } catch (error) {
        this.logger.error(`Failed to purge account ${user.email}:`, error);
      }
    }
  }
}
