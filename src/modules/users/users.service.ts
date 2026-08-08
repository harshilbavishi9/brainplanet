import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Planet } from '../../database/entities';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Planet) private readonly planetRepo: Repository<Planet>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    if (!user.lastActiveAt) {
      user.streak = 1;
      user.lastActiveAt = now;
      await this.userRepo.save(user);
    } else {
      const lastActiveDate = new Date(user.lastActiveAt).toISOString().split('T')[0];
      const todayDate = now.toISOString().split('T')[0];

      if (lastActiveDate !== todayDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];

        if (lastActiveDate === yesterdayDate) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }
        user.lastActiveAt = now;
        await this.userRepo.save(user);
      }
    }

    return user;
  }

  async resetProgress(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.brainLevel = 1;
    user.xp = 0;
    user.coins = 100;
    user.streak = 0;
    user.lastActiveAt = null;
    await this.userRepo.save(user);

    let planet = await this.planetRepo.findOne({ where: { userId: id } });
    if (planet) {
      planet.health = 75.0;
      planet.mood = 7;
      planet.unlockedObjects = [];
      planet.totalReelsSaved = 0;
      planet.activePlanet = 'earth';
      await this.planetRepo.save(planet);
    }

    return user;
  }

  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepo.update(id, updateData);
    return this.findOne(id);
  }

  async addXPAndCoins(id: string, xpToAdd: number, coinsToAdd: number): Promise<User> {
    const user = await this.findOne(id);
    user.xp += xpToAdd;
    user.coins += coinsToAdd;

    // Brain Level Calculation (simple exponential formula: level = floor(sqrt(xp / 100)) + 1)
    // E.g., Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
    const newLevel = Math.floor(Math.sqrt(user.xp / 100)) + 1;
    if (newLevel > user.brainLevel) {
      user.brainLevel = newLevel;
    }

    return this.userRepo.save(user);
  }

  async getLeaderboard(limit = 10): Promise<User[]> {
    return this.userRepo.find({
      order: { brainLevel: 'DESC', xp: 'DESC' },
      take: limit,
      select: ['id', 'displayName', 'avatarUrl', 'brainLevel', 'xp', 'streak'],
    });
  }
}
