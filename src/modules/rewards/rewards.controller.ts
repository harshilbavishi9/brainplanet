import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RewardsService } from './rewards.service';

@ApiTags('rewards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  @ApiOperation({ summary: 'List all rewards and their lock/unlock states' })
  getRewards(@Request() req: any) {
    return this.rewardsService.getRewards(req.user.id);
  }

  @Post('unlock/:rewardId')
  @ApiOperation({ summary: 'Unlock/purchase a reward' })
  unlockReward(@Request() req: any, @Param('rewardId') rewardId: string) {
    return this.rewardsService.purchaseReward(req.user.id, rewardId);
  }
}
