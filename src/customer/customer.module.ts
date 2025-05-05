import { Module } from '@nestjs/common';

import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { GetCustomers } from './use-cases';

import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [CustomerController],
  providers: [CustomerService, GetCustomers],
})
export class CustomerModule {}
