import { Controller, Post, Get, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SocialUsageService } from './social-usage.service';

@ApiTags('usage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usage')
export class SocialUsageController {
  constructor(private readonly usageService: SocialUsageService) {}

  @Post('log')
  @ApiOperation({ summary: 'Log current usage stats from the device' })
  logUsage(
    @Request() req: any,
    @Body('usages') usages: { appName: string; usedMinutes: number }[],
  ) {
    return this.usageService.logDailyUsage(req.user.id, usages);
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get user app limits configuration' })
  getLimits(@Request() req: any) {
    return this.usageService.getDailyLimits(req.user.id);
  }

  @Patch('limits/:appName')
  @ApiOperation({ summary: 'Update limit for a specific app' })
  updateLimit(
    @Request() req: any,
    @Param('appName') appName: string,
    @Body('limitMinutes') limitMinutes: number,
  ) {
    return this.usageService.updateDailyLimit(req.user.id, appName, limitMinutes);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's usage logs" })
  getToday(@Request() req: any) {
    return this.usageService.getTodayUsage(req.user.id);
  }
}
