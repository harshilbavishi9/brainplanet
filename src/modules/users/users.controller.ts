import { Controller, Get, Post, Body, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Post('reset-progress')
  @ApiOperation({ summary: 'Reset user progress and planet' })
  resetProgress(@Request() req: any) {
    return this.usersService.resetProgress(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile details' })
  updateProfile(@Request() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global leaderboard' })
  getLeaderboard(@Query('limit') limit?: number) {
    return this.usersService.getLeaderboard(limit ? Number(limit) : 10);
  }
}
