import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planet, SocialUsage, AppLimit } from '../../database/entities';

@Injectable()
export class PlanetService {
  constructor(
    @InjectRepository(Planet) private planetRepo: Repository<Planet>,
    @InjectRepository(SocialUsage) private usageRepo: Repository<SocialUsage>,
    @InjectRepository(AppLimit) private limitRepo: Repository<AppLimit>,
  ) {}

  async getPlanet(userId: string): Promise<Planet> {
    const planet = await this.planetRepo.findOne({ where: { userId } });
    if (!planet) throw new NotFoundException('Planet not found');
    return planet;
  }

  async getHealth(userId: string): Promise<{ health: number; tier: string }> {
    const planet = await this.getPlanet(userId);
    const tier = this._healthTier(planet.health);
    return { health: Number(planet.health), tier };
  }

  async syncFromClient(userId: string, data: any): Promise<Planet> {
    let planet = await this.planetRepo.findOne({ where: { userId } });
    if (!planet) {
      planet = this.planetRepo.create({ userId, health: 75 });
    }
    if (data.health !== undefined) {
      planet.health = Math.min(100, Math.max(0, data.health));
    }
    if (data.totalReelsSaved !== undefined) {
      planet.totalReelsSaved = data.totalReelsSaved;
    }
    if (data.activePlanet !== undefined) {
      planet.activePlanet = data.activePlanet;
    }
    if (data.unlockedObjects !== undefined) {
      planet.unlockedObjects = data.unlockedObjects;
    }
    return this.planetRepo.save(planet);
  }

  async getGalaxyState(userId: string): Promise<any> {
    const planet = await this.getPlanet(userId);
    const totalSaved = planet.totalReelsSaved ?? 0;
    const activePlanet = planet.activePlanet ?? 'earth';

    const thresholds: Record<string, number> = {
      earth: 0, moon: 500, mars: 1500, venus: 3000, jupiter: 5000,
      saturn: 8000, uranus: 12000, neptune: 17000, crystal: 23000,
      lava: 30000, forest: 38000, cyber: 48000, galaxyCore: 60000,
    };

    const planets = Object.entries(thresholds).map(([name, threshold]) => ({
      name,
      threshold,
      isUnlocked: totalSaved >= threshold || name === 'earth',
      progress: threshold === 0 ? 1.0 : Math.min(1.0, totalSaved / threshold),
    }));

    return {
      activePlanet,
      totalReelsSaved: totalSaved,
      planets,
    };
  }

  private _healthTier(health: number | string): string {
    const h = Number(health);
    if (h >= 90) return 'thriving';
    if (h >= 70) return 'healthy';
    if (h >= 55) return 'good';
    if (h >= 40) return 'warning';
    if (h >= 25) return 'damaged';
    if (h >= 10) return 'critical';
    return 'dying';
  }
}
