import { Module } from '@nestjs/common';
import { PlanetGateway } from './planet.gateway';

@Module({
  providers: [PlanetGateway],
  exports: [PlanetGateway],
})
export class WebsocketsModule {}
