import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialUsage, AppLimit } from '../../database/entities';

@Injectable()
export class SocialUsageService {
  constructor(
    @InjectRepository(SocialUsage)
    private readonly usageRepo: Repository<SocialUsage>,
    @InjectRepository(AppLimit)
    private readonly limitRepo: Repository<AppLimit>,
  ) {}

  async logDailyUsage(
    userId: string,
    usages: { appName: string; usedMinutes: number }[],
  ): Promise<SocialUsage[]> {
    const today = new Date().toISOString().split('T')[0];
    const results: SocialUsage[] = [];

    for (const item of usages) {
      // Validate tracking constraint: instagram, snapchat, facebook, youtube
      const allowed = ['instagram', 'snapchat', 'facebook', 'youtube'];
      if (!allowed.includes(item.appName.toLowerCase())) {
        throw new BadRequestException(
          `Invalid app tracking name: ${item.appName}. Only Instagram, Snapchat, Facebook, and YouTube are allowed.`,
        );
      }

      // Check if entry for today exists
      let usage = await this.usageRepo.findOne({
        where: { userId, appName: item.appName.toLowerCase(), date: today },
      });

      if (usage) {
        usage.usedMinutes = item.usedMinutes;
      } else {
        usage = this.usageRepo.create({
          userId,
          appName: item.appName.toLowerCase(),
          usedMinutes: item.usedMinutes,
          date: today,
        });
      }
      results.push(await this.usageRepo.save(usage));
    }

    return results;
  }

  async getDailyLimits(userId: string): Promise<AppLimit[]> {
    const limits = await this.limitRepo.find({ where: { userId } });
    if (limits.length === 0) {
      // Initialize default limits
      const defaults = [
        { appName: 'instagram', dailyLimitMin: 30 },
        { appName: 'facebook', dailyLimitMin: 30 },
        { appName: 'youtube', dailyLimitMin: 45 },
        { appName: 'snapchat', dailyLimitMin: 30 },
      ];
      const createdLimits: AppLimit[] = [];
      for (const item of defaults) {
        const limit = this.limitRepo.create({
          userId,
          appName: item.appName,
          dailyLimitMin: item.dailyLimitMin,
        });
        createdLimits.push(await this.limitRepo.save(limit));
      }
      return createdLimits;
    }
    return limits;
  }

  async updateDailyLimit(
    userId: string,
    appName: string,
    limitMin: number,
  ): Promise<AppLimit> {
    let limit = await this.limitRepo.findOne({
      where: { userId, appName: appName.toLowerCase() },
    });

    if (limit) {
      limit.dailyLimitMin = limitMin;
    } else {
      limit = this.limitRepo.create({
        userId,
        appName: appName.toLowerCase(),
        dailyLimitMin: limitMin,
      });
    }

    return this.limitRepo.save(limit);
  }

  async getTodayUsage(userId: string): Promise<SocialUsage[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.usageRepo.find({ where: { userId, date: today } });
  }
}
