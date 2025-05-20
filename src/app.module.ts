import { Module } from '@nestjs/common';

import { CustomerModule } from './customer/customer.module';
import { CommonModule } from './common/common.module';
import { ContractModule } from './contract/contract.module';
import { AuthModule } from './auth/auth.module';
import { CronModule } from './cron/cron.module';
import { OAuthModule } from './oauth/oauth.module';

@Module({
  imports: [AuthModule, CustomerModule, CommonModule, ContractModule, CronModule, OAuthModule],
  controllers: [],
  exports: [CommonModule],
})
export class AppModule {}
