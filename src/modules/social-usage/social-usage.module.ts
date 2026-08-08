import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialUsageController } from './social-usage.controller';
import { SocialUsageService } from './social-usage.service';
import { SocialUsage, AppLimit } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([SocialUsage, AppLimit])],
  controllers: [SocialUsageController],
  providers: [SocialUsageService],
  exports: [SocialUsageService],
})
export class SocialUsageModule {}

