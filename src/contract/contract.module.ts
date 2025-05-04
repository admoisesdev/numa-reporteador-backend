import { Module } from '@nestjs/common';

import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';

import {
  GetChargedPortfolio,
  GetContractAccountStatus,
  GetContractsCustomer,
  GetPortfolioAge,
  GetReceivables,
} from './use-cases';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [ContractController],
  providers: [
    ContractService,
    GetContractsCustomer,
    GetContractAccountStatus,
    GetChargedPortfolio,
    GetPortfolioAge,
    GetReceivables,
  ],
})
export class ContractModule {}
