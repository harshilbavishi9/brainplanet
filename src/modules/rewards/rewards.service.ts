import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PlanetService } from '../planet/planet.service';

export interface RewardItem {
  id: string;
  name: string;
  emoji: string;
  type: 'creature' | 'structure';
  requiredXp: number;
  costCoins: number;
}

@Injectable()
export class RewardsService {
  private readonly rewardCatalog: RewardItem[] = [
    { id: 'fox', name: 'Cosmic Fox', emoji: '🦊', type: 'creature', requiredXp: 150, costCoins: 50 },
    { id: 'owl', name: 'Stardust Owl', emoji: '🦉', type: 'creature', requiredXp: 300, costCoins: 100 },
    { id: 'dragon', name: 'Nebula Dragon', emoji: '🐉', type: 'creature', requiredXp: 800, costCoins: 250 },
    { id: 'tree', name: 'Ancient Tree', emoji: '🌳', type: 'structure', requiredXp: 100, costCoins: 30 },
    { id: 'shrine', name: 'Zen Garden', emoji: '⛩️', type: 'structure', requiredXp: 250, costCoins: 80 },
    { id: 'observatory', name: 'Observatory', emoji: '🔭', type: 'structure', requiredXp: 500, costCoins: 150 },
    { id: 'castle', name: 'Crystal Castle', emoji: '🏰', type: 'structure', requiredXp: 1000, costCoins: 400 },
  ];

  constructor(
    private readonly usersService: UsersService,
    private readonly planetService: PlanetService,
  ) {}

  async getRewards(userId: string) {
    const user = await this.usersService.findOne(userId);
    const planet = await this.planetService.getPlanet(userId);
    const unlocked = planet.unlockedObjects || [];

    return this.rewardCatalog.map((reward) => ({
      ...reward,
      isUnlocked: unlocked.includes(reward.id),
      canUnlock: user.xp >= reward.requiredXp && user.coins >= reward.costCoins && !unlocked.includes(reward.id),
    }));
  }

  async purchaseReward(userId: string, rewardId: string) {
    const reward = this.rewardCatalog.find((r) => r.id === rewardId);
    if (!reward) throw new BadRequestException('Reward item not found');

    const user = await this.usersService.findOne(userId);
    const planet = await this.planetService.getPlanet(userId);
    const unlocked = planet.unlockedObjects || [];

    if (unlocked.includes(rewardId)) {
      throw new BadRequestException('Item already unlocked');
    }
    if (user.xp < reward.requiredXp) {
      throw new BadRequestException('Insufficient XP to unlock this reward');
    }
    if (user.coins < reward.costCoins) {
      throw new BadRequestException('Insufficient coins to purchase this reward');
    }

    // Deduct coins
    await this.usersService.updateProfile(userId, { coins: user.coins - reward.costCoins });

    // Unlock object on planet
    unlocked.push(rewardId);
    await this.planetService.syncFromClient(userId, { unlockedObjects: unlocked });

    return {
      message: `${reward.name} unlocked successfully!`,
      unlockedObjects: unlocked,
      remainingCoins: user.coins - reward.costCoins,
    };
  }
}
