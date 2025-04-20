import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CustomerModule, CommonModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
