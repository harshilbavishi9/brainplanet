import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Planet, SocialUsage, AppLimit } from '../../database/entities';
import { PlanetController } from './planet.controller';
import { PlanetService } from './planet.service';
@Module({ imports: [TypeOrmModule.forFeature([Planet, SocialUsage, AppLimit])], controllers: [PlanetController], providers: [PlanetService], exports: [PlanetService] })
export class PlanetModule {}
