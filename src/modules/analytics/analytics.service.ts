import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialUsage } from '../../database/entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(SocialUsage)
    private readonly usageRepo: Repository<SocialUsage>,
  ) {}

  async getTodayStats(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const usages = await this.usageRepo.find({ where: { userId, date: today } });

    return usages.map((u) => ({
      appName: u.appName,
      usedMinutes: u.usedMinutes,
    }));
  }

  async getWeeklyStats(userId: string) {
    // Generate last 7 days including today
    const stats: Record<string, Record<string, number>> = {};
    const dates: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);
      stats[dateStr] = {
        instagram: 0,
        facebook: 0,
        youtube: 0,
        snapchat: 0,
      };
    }

    // Retrieve database entries
    const usages = await this.usageRepo.createQueryBuilder('usage')
      .where('usage.userId = :userId', { userId })
      .andWhere('usage.date IN (:...dates)', { dates })
      .getMany();

    usages.forEach((u) => {
      if (stats[u.date]) {
        stats[u.date][u.appName] = u.usedMinutes;
      }
    });

    return dates.map((date) => ({
      date,
      dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      usage: stats[date],
    }));
  }

  async getMonthlyStats(userId: string) {
    // Distribute total minutes per app for the past 30 days
    const result = await this.usageRepo.createQueryBuilder('usage')
      .select('usage.appName', 'appName')
      .addSelect('SUM(usage.usedMinutes)', 'totalMinutes')
      .where('usage.userId = :userId', { userId })
      .andWhere('usage.createdAt >= NOW() - INTERVAL \'30 days\'')
      .groupBy('usage.appName')
      .getRawMany();

    return result.map((r) => ({
      appName: r.appName,
      totalMinutes: Number(r.totalMinutes),
    }));
  }
}
