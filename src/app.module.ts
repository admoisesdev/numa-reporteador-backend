import { Module } from '@nestjs/common';

import { CustomerModule } from './customer/customer.module';
import { CommonModule } from './common/common.module';
import { ContractModule } from './contract/contract.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, CustomerModule, CommonModule, ContractModule, CompanyModule, UserModule],
  controllers: [],
  exports: [CommonModule],
})
export class AppModule {}
