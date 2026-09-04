import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    console.log("Health checked")
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Scroll Space Backend API',
      uptime: process.uptime(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Root API endpoint' })
  getRoot() {
    return {
      status: 'ok',
      message: 'Scroll Space API Server running',
      version: '1.0.0',
    };
  }
}
