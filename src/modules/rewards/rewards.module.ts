import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { UsersModule } from '../users/users.module';
import { PlanetModule } from '../planet/planet.module';

@Module({
  imports: [UsersModule, PlanetModule],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}

