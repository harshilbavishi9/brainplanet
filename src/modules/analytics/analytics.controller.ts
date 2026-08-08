import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's usage statistics" })
  getToday(@Request() req: any) {
    return this.analyticsService.getTodayStats(req.user.id);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly usage statistics' })
  getWeekly(@Request() req: any) {
    return this.analyticsService.getWeeklyStats(req.user.id);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly usage statistics' })
  getMonthly(@Request() req: any) {
    return this.analyticsService.getMonthlyStats(req.user.id);
  }
}
