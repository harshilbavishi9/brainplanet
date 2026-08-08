import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FocusSessionsService } from './focus-sessions.service';

@ApiTags('focus')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('focus')
export class FocusSessionsController {
  constructor(private readonly sessionsService: FocusSessionsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new focus session' })
  startSession(@Request() req: any, @Body('durationMin') durationMin: number) {
    return this.sessionsService.createSession(req.user.id, durationMin);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a running focus session' })
  completeSession(@Request() req: any, @Param('id') id: string) {
    return this.sessionsService.completeSession(req.user.id, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel/abandon a running focus session' })
  cancelSession(@Request() req: any, @Param('id') id: string) {
    return this.sessionsService.cancelSession(req.user.id, id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get focus session history' })
  getHistory(@Request() req: any) {
    return this.sessionsService.getSessionHistory(req.user.id);
  }
}
