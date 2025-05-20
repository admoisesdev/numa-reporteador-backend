import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { TempController } from './temp.controller';
import { CommonModule } from 'src/common/common.module';
import { UpdateContracts } from './use-cases/update-contracts';
import { OAuthModule } from 'src/oauth/oauth.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [CommonModule, OAuthModule, ScheduleModule.forRoot(),
],
  controllers: [TempController],
  providers: [CronService, UpdateContracts]
})
export class CronModule {}
