import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { CommonModule } from './common/common.module';
import { ContractModule } from './contract/contract.module';

@Module({
  imports: [CustomerModule, CommonModule, ContractModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
