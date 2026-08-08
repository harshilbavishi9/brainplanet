import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MissionsService } from './missions.service';

@ApiTags('missions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get()
  @ApiOperation({ summary: "Get user's daily/weekly missions list" })
  getMissions(@Request() req: any) {
    return this.missionsService.getMissions(req.user.id);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Update progress of a mission' })
  updateProgress(
    @Request() req: any,
    @Param('id') id: string,
    @Body('value') value: number,
  ) {
    return this.missionsService.updateMissionProgress(req.user.id, id, value);
  }
}
