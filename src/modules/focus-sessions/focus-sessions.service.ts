import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FocusSession, DailyMission } from '../../database/entities';
import { UsersService } from '../users/users.service';
import { PlanetService } from '../planet/planet.service';

@Injectable()
export class FocusSessionsService {
  constructor(
    @InjectRepository(FocusSession)
    private readonly sessionRepo: Repository<FocusSession>,
    @InjectRepository(DailyMission)
    private readonly missionRepo: Repository<DailyMission>,
    private readonly usersService: UsersService,
    private readonly planetService: PlanetService,
  ) {}

  async createSession(userId: string, durationMin: number): Promise<FocusSession> {
    if (durationMin <= 0) {
      throw new BadRequestException('Duration must be greater than zero');
    }

    const session = this.sessionRepo.create({
      userId,
      durationMin,
      startedAt: new Date(),
    });

    return this.sessionRepo.save(session);
  }

  async completeSession(userId: string, sessionId: string): Promise<FocusSession> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      throw new BadRequestException('Focus session not found');
    }
    if (session.isCompleted || session.isCancelled) {
      throw new BadRequestException('Session is already finalized');
    }

    // Award XP (e.g. 5 XP per min) and Coins (e.g. 20 coins flat)
    const xpEarned = session.durationMin * 5;
    const coinsEarned = 20;

    session.isCompleted = true;
    session.completedAt = new Date();
    session.xpEarned = xpEarned;
    session.coinsEarned = coinsEarned;
    await this.sessionRepo.save(session);

    // Update user stats
    await this.usersService.addXPAndCoins(userId, xpEarned, coinsEarned);

    // Update daily focus mission progress
    try {
      const today = new Date().toISOString().split('T')[0];
      const focusMission = await this.missionRepo.findOne({
        where: { userId, type: 'focus', date: today },
      });
      if (focusMission && !focusMission.isCompleted) {
        focusMission.currentValue += session.durationMin;
        if (focusMission.currentValue >= focusMission.targetValue) {
          focusMission.isCompleted = true;
          focusMission.completedAt = new Date();
          await this.usersService.addXPAndCoins(
            userId,
            focusMission.xpReward,
            focusMission.coinReward,
          );
        }
        await this.missionRepo.save(focusMission);
      }
    } catch (err) {
      // Ignore daily mission update errors to avoid breaking the core session flow
    }

    // Heal planet (e.g. 10 HP flat)
    await this.planetService.syncFromClient(userId, {
      health: (await this.planetService.getHealth(userId)).health + 10,
    });

    return session;
  }

  async cancelSession(userId: string, sessionId: string): Promise<FocusSession> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      throw new BadRequestException('Focus session not found');
    }
    if (session.isCompleted || session.isCancelled) {
      throw new BadRequestException('Session is already finalized');
    }

    session.isCancelled = true;
    session.completedAt = new Date();
    return this.sessionRepo.save(session);
  }

  async getSessionHistory(userId: string): Promise<FocusSession[]> {
    return this.sessionRepo.find({
      where: { userId },
      order: { startedAt: 'DESC' },
      take: 20,
    });
  }
}
