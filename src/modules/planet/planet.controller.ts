import {
  Controller, Get, Post, Body, Patch, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlanetService } from './planet.service';

@ApiTags('planet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planet')
export class PlanetController {
  constructor(private readonly planetService: PlanetService) {}

  @Get()
  @ApiOperation({ summary: "Get current user's planet state" })
  getPlanet(@Request() req: any) {
    return this.planetService.getPlanet(req.user.id);
  }

  @Get('health')
  @ApiOperation({ summary: 'Get planet health score' })
  getHealth(@Request() req: any) {
    return this.planetService.getHealth(req.user.id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync planet state from client' })
  syncPlanet(@Request() req: any, @Body() body: any) {
    return this.planetService.syncFromClient(req.user.id, body);
  }

  @Get('galaxy')
  @ApiOperation({ summary: 'Get current user galaxy state (13 planets unlock status)' })
  getGalaxy(@Request() req: any) {
    return this.planetService.getGalaxyState(req.user.id);
  }
}
