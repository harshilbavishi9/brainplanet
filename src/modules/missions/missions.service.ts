import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyMission } from '../../database/entities';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(DailyMission)
    private readonly missionRepo: Repository<DailyMission>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getMissions(userId: string): Promise<DailyMission[]> {
    const today = new Date().toISOString().split('T')[0];
    const missions = await this.missionRepo.find({ where: { userId, date: today } });

    if (missions.length === 0) {
      const pool = [
        { type: 'focus', title: 'Focus for 25 minutes', targetValue: 25, coinReward: 15, xpReward: 30 },
        { type: 'instagram', title: 'Keep Instagram under 30 mins', targetValue: 30, coinReward: 20, xpReward: 40 },
        { type: 'snapchat', title: 'Snapchat less than 15 mins', targetValue: 15, coinReward: 25, xpReward: 50 },
        { type: 'youtube', title: 'YouTube under 45 mins', targetValue: 45, coinReward: 20, xpReward: 40 },
        { type: 'facebook', title: 'Facebook less than 20 mins', targetValue: 20, coinReward: 15, xpReward: 30 },
        { type: 'focus', title: 'Deep Focus: 50 minutes', targetValue: 50, coinReward: 40, xpReward: 80 },
        { type: 'focus', title: 'Quick Focus: 15 minutes', targetValue: 15, coinReward: 10, xpReward: 20 },
        { type: 'instagram', title: 'Instagram Limit: 10 mins', targetValue: 10, coinReward: 35, xpReward: 70 },
        { type: 'snapchat', title: 'Snapchat Limit: 5 mins', targetValue: 5, coinReward: 40, xpReward: 80 },
        { type: 'youtube', title: 'YouTube Limit: 20 mins', targetValue: 20, coinReward: 30, xpReward: 60 },
      ];

      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const defaults = shuffled.slice(0, 3);

      const seeded: DailyMission[] = [];
      for (const item of defaults) {
        const mission = this.missionRepo.create({
          userId,
          type: item.type,
          title: item.title,
          targetValue: item.targetValue,
          currentValue: 0,
          coinReward: item.coinReward,
          xpReward: item.xpReward,
          date: today,
        });
        seeded.push(await this.missionRepo.save(mission));
      }

      try {
        await this.notificationsService.sendPlanetAlert(
          userId,
          `New daily missions have arrived! Protect your mind today.`,
        );
      } catch (e) {
        // Ignore notification errors
      }

      return seeded;
    }
    return missions;
  }

  async updateMissionProgress(
    userId: string,
    missionId: string,
    value: number,
  ): Promise<DailyMission> {
    const mission = await this.missionRepo.findOne({ where: { id: missionId, userId } });
    if (!mission) throw new Error('Mission not found');

    if (mission.isCompleted) return mission;

    mission.currentValue = value;
    if (mission.currentValue >= mission.targetValue) {
      mission.isCompleted = true;
      mission.completedAt = new Date();
      await this.usersService.addXPAndCoins(userId, mission.xpReward, mission.coinReward);
    }

    return this.missionRepo.save(mission);
  }
}
